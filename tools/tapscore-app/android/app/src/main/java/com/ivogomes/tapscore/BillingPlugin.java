package com.ivogomes.tapscore;

import android.app.Activity;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.List;
import java.util.function.Consumer;

// Google Play Billing wrapper for the single one-time "pro_unlock" product. Replaces RevenueCat
// (tools/tapscore-app/README.md § "In-app purchases") — one SKU, no subscriptions, no cross-platform
// account, so talking to Play Billing directly is simpler than routing through a third party.
//
// JS contract (tools/tapscore/index.html): getProduct() -> {id, priceString|null}; isOwned()/restore()
// -> {owned}; purchase() -> {owned}, or {owned:false, pending:true}, or rejects with code "USER_CANCELLED"
// for a user-initiated cancel (any other rejection is a real failure).
@CapacitorPlugin(name = "Billing")
public class BillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private static final String SKU = "pro_unlock";

    private BillingClient billingClient;
    private ProductDetails cachedProductDetails;
    private PluginCall purchaseCall;   // the in-flight purchase() call; resolved/rejected from onPurchasesUpdated

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection()
            .build();
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {}

            @Override
            public void onBillingServiceDisconnected() {}   // enableAutoServiceReconnection() retries for us
        });
    }

    @Override
    protected void handleOnDestroy() {
        if (billingClient != null) billingClient.endConnection();
    }

    @PluginMethod
    public void getProduct(PluginCall call) {
        withConnection(
            () -> queryProductDetails(details -> {
                JSObject r = new JSObject();
                r.put("id", SKU);
                r.put("priceString", details != null ? details.getOneTimePurchaseOfferDetails().getFormattedPrice() : null);
                call.resolve(r);
            }),
            message -> {
                JSObject r = new JSObject();
                r.put("id", SKU);
                r.put("priceString", null);   // non-fatal: the store just hasn't answered yet
                call.resolve(r);
            }
        );
    }

    @PluginMethod
    public void isOwned(PluginCall call) {
        withConnection(
            () -> checkOwned(owned -> {
                JSObject r = new JSObject();
                r.put("owned", owned);
                call.resolve(r);
            }),
            message -> {
                JSObject r = new JSObject();
                r.put("owned", false);
                call.resolve(r);
            }
        );
    }

    @PluginMethod
    public void restore(PluginCall call) {
        isOwned(call);
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("no activity");
            return;
        }
        purchaseCall = call;
        withConnection(
            () -> {
                if (cachedProductDetails != null) {
                    launchFlow(activity, cachedProductDetails);
                } else {
                    queryProductDetails(details -> {
                        if (details == null) {
                            failPurchase("product unavailable", "NO_PRODUCT");
                            return;
                        }
                        launchFlow(activity, details);
                    });
                }
            },
            message -> failPurchase(message, "BILLING_UNAVAILABLE")
        );
    }

    private void launchFlow(Activity activity, ProductDetails details) {
        BillingFlowParams params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(Collections.singletonList(
                BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(details)
                    .build()
            ))
            .build();
        billingClient.launchBillingFlow(activity, params);
        // result arrives asynchronously in onPurchasesUpdated()
    }

    private void failPurchase(String message, String code) {
        PluginCall call = purchaseCall;
        purchaseCall = null;
        if (call != null) call.reject(message, code);
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall call = purchaseCall;
        purchaseCall = null;
        if (call == null) return;   // no in-flight purchase() call to resolve (shouldn't normally happen)

        if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            call.reject("cancelled", "USER_CANCELLED");
            return;
        }
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || purchases == null) {
            call.reject(result.getDebugMessage(), String.valueOf(result.getResponseCode()));
            return;
        }
        for (Purchase purchase : purchases) {
            if (!purchase.getProducts().contains(SKU)) continue;
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                JSObject r = new JSObject();
                r.put("owned", false);
                r.put("pending", true);
                call.resolve(r);
                return;
            }
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                acknowledgeIfNeeded(purchase, () -> {
                    JSObject r = new JSObject();
                    r.put("owned", true);
                    call.resolve(r);
                });
                return;
            }
        }
        JSObject r = new JSObject();
        r.put("owned", false);
        call.resolve(r);
    }

    // --- helpers ---

    private void withConnection(Runnable onReady, Consumer<String> onFail) {
        if (billingClient.isReady()) {
            onReady.run();
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) onReady.run();
                else onFail.accept(result.getDebugMessage());
            }

            @Override
            public void onBillingServiceDisconnected() {
                onFail.accept("billing service disconnected");
            }
        });
    }

    private void queryProductDetails(Consumer<ProductDetails> callback) {
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
            .setProductList(Collections.singletonList(
                QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(SKU)
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build()
            ))
            .build();
        billingClient.queryProductDetailsAsync(params, (result, productDetailsResult) -> {
            List<ProductDetails> list = productDetailsResult.getProductDetailsList();
            ProductDetails details = (list != null && !list.isEmpty()) ? list.get(0) : null;
            if (details != null) cachedProductDetails = details;
            callback.accept(details);
        });
    }

    private void checkOwned(Consumer<Boolean> callback) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build();
        billingClient.queryPurchasesAsync(params, (result, purchases) -> {
            for (Purchase purchase : purchases) {
                if (!purchase.getProducts().contains(SKU)) continue;
                if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    acknowledgeIfNeeded(purchase, () -> callback.accept(true));
                    return;
                }
            }
            callback.accept(false);
        });
    }

    // Google auto-refunds a PURCHASED item left unacknowledged for 3 days — this runs on every
    // ownership check (launch, Restore tap, right after a successful purchase), not just the first one.
    private void acknowledgeIfNeeded(Purchase purchase, Runnable onDone) {
        if (purchase.isAcknowledged()) {
            onDone.run();
            return;
        }
        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.getPurchaseToken())
            .build();
        billingClient.acknowledgePurchase(params, result -> onDone.run());
    }
}

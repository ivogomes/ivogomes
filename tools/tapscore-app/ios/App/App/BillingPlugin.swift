import Foundation
import Capacitor
import StoreKit

// StoreKit 2 wrapper for the single one-time "pro_unlock" product. Replaces RevenueCat
// (tools/tapscore-app/README.md § "In-app purchases") — one SKU, no subscriptions, no
// cross-platform account, so talking to StoreKit directly is simpler than a third party.
//
// JS contract (tools/tapscore/index.html): getProduct() -> {id, priceString|null}; isOwned()/restore()
// -> {owned}; purchase() -> {owned}, or {owned:false, pending:true}, or rejects with code
// "USER_CANCELLED" for a user-initiated cancel (any other rejection is a real failure).
@objc(BillingPlugin)
public class BillingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BillingPlugin"
    public let jsName = "Billing"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProduct", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isOwned", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]

    private static let sku = "pro_unlock"
    private var cachedProduct: Product?

    @objc func getProduct(_ call: CAPPluginCall) {
        Task {
            do {
                cachedProduct = try await Product.products(for: [Self.sku]).first
                call.resolve(["id": Self.sku, "priceString": cachedProduct?.displayPrice ?? NSNull()])
            } catch {
                call.resolve(["id": Self.sku, "priceString": NSNull()])   // non-fatal: try again later
            }
        }
    }

    @objc func isOwned(_ call: CAPPluginCall) {
        Task { call.resolve(["owned": await currentlyOwned()]) }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            try? await AppStore.sync()   // best-effort; fall through to the entitlement check regardless
            call.resolve(["owned": await currentlyOwned()])
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task {
            do {
                guard let product = cachedProduct ?? (try await Product.products(for: [Self.sku]).first) else {
                    call.reject("product unavailable", "NO_PRODUCT")
                    return
                }
                switch try await product.purchase() {
                case .success(.verified(let transaction)):
                    await transaction.finish()
                    call.resolve(["owned": true])
                case .success(.unverified):
                    call.reject("unverified transaction", "UNVERIFIED")
                case .userCancelled:
                    call.reject("cancelled", "USER_CANCELLED")
                case .pending:
                    call.resolve(["owned": false, "pending": true])
                @unknown default:
                    call.reject("unknown purchase result", "UNKNOWN")
                }
            } catch {
                call.reject(error.localizedDescription, "PURCHASE_FAILED")
            }
        }
    }

    // Every unlock check re-verifies against the store (no local acknowledgment step needed on iOS —
    // StoreKit 2 transactions are already "acknowledged" once `finish()` is called at purchase time).
    private func currentlyOwned() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result, transaction.productID == Self.sku {
                return true
            }
        }
        return false
    }
}

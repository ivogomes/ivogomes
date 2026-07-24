import Capacitor

// Registers app-local Capacitor plugins (Capacitor 6 `capacitorDidLoad` hook).
// Set this class as the custom class of the bridge view controller in Main.storyboard.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(WatchLinkPlugin())
    }
}

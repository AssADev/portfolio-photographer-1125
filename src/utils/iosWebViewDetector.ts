export function detectIosWebView() {
	const savedFlag = sessionStorage.getItem('is-ios-webview');
	if (savedFlag === 'true') return true;

	// Method #1
	// See: https://developer.apple.com/documentation/webkit/wkscriptmessagehandler
	// window.webkit.messageHandlers is defined in WKWebView with WKScriptMessageHandler
	// 1) if window.webkit.messageHandlers is present then it is 100% WKWebView
	// 2) if window.webkit.messageHandlers is not present then it could be:
	//    2.1) WKWebView without WKScriptMessageHandler
	//    2.2) not a WKWebView
	// @ts-expect-error - window.webkit.messageHandlers is not typed
	if (window?.webkit?.messageHandlers) {
		return true;
	}

	let isIosWebView = false;

	// Method #2
	const webViewDetector = document.createElement('div');
	webViewDetector.style.cssText =
		'width: 100%; height: 100lvh; position: fixed; top: 0; left: 0; visibility: hidden;';
	document.body.appendChild(webViewDetector);

	if (
		webViewDetector.offsetHeight === window.innerHeight &&
		/iPad|iPhone|iPod/.test(navigator.userAgent) &&
		// @ts-expect-error - window.MSStream is not typed
		!window.MSStream
	) {
		isIosWebView = true;
	}

	webViewDetector.remove();

	sessionStorage.setItem('is-ios-webview', `${isIosWebView}`);

	return isIosWebView;
}

export const isWebView = detectIosWebView();

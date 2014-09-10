var contextMenu = require("sdk/context-menu");
var tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;


function webmention(url) {
	Request({
		url: url,
		onComplete: function(res) {
			if(res.status == 200) {
				// Find out webmention endpoint. Can be rel="webmention", rel="http://webmention.org/", rel="webmention http://webmention.org/", etc.
				m = res.text.match(/<link .*rel *= *"(?:(?:webmention|http:\/\/webmention.org\/?) *)+" .*href *= *"(.+?)"/)
				 || res.text.match(/<link .*href *= *"(.+?)" .*rel *= *"(?:(?:webmention|http:\/\/webmention.org\/?) *)+"/); // The order between rel and href can be different

				if (!m) return false;

				endpoint = m[1];

				Request({
					url: endpoint,
					content: {
						source: tabs.activeTab.url,
						target: url
					},
					onComplete: function(res) {
						dump(res);
					}
				}).post();
			}
		}
	}).get();
}

var menuItem = contextMenu.Item({
	label: "Send Webmention",
	context: contextMenu.SelectorContext("a[href]"),
	contentScript: 'self.on("click", function (node) {' +
	               '  self.postMessage(node.href);' +
	               '});',
	onMessage: function (url) {
		webmention(url);
	}
});
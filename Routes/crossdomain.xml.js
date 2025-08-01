exports.data = {
	Name: "crossdomain.xml",
	Method: "GET"
};

exports.run = (req, res) => {
	res.set("Content-Type", "text/xml");

	res.send(
		`<cross-domain-policy><site-control permitted-cross-domain-policies="all"/><allow-access-from domain="*" to-ports="*" secure="false"/><allow-http-request-headers-from domain="*" headers="*" secure="false"/></cross-domain-policy>`
	);
};

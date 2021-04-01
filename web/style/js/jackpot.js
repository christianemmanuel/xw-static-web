function formatNumberStr(nStr) {
	nStr += "";
	x = nStr.split(".");
	x1 = x[0];
//	x2 = x.length > 1 ? "." + x[1] : "";
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, "$1" + "," + "$2");
	}
//	return x1 + x2;
	return x1;
}

Ticker.prototype.showJackpot = function(id) {
	var newvalue = this.getJackpot();

	if (this.type != "count") {
		newvalue = Math.round(newvalue * 100) / 100 + "";
		if (newvalue.match(/^\d+\.\d$/)) {
			newvalue = newvalue + "0";
		}
		if (newvalue.match(/^\d+$/)) {
			newvalue = newvalue + ".00";
		}
	}
	var text = "LOADING";
	if (newvalue > 0) {
		text = (this.signpos != 0 ? formatNumberStr(newvalue) + this.sign
				: this.sign + formatNumberStr(newvalue));
	}
	if (newvalue > 0 && this.type == "count") {
		text = newvalue;
	}

	this.textbox.innerHTML = text;
}
var ptJackpot = new Ticker({
	info : 2,
	casino : 'drunkenmonkey88',
	currency : 'cny'
});
ptJackpot.SetCurrencyPos(0);
ptJackpot.SetCurrencySign("￥");
ptJackpot.attachToTextBox('numBox');
/*ptJackpot.attachToTextBox('moneyBox');*/
ptJackpot.tick();

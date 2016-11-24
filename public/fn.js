/**
 * The 'fn' object serves as a globally-accessible repository for frequently-used functions.
 * In most instances, any methods added to this object should begin with a lower-case letter.
 *
 * For example:
 *
 * fn.doSomething();
 */

window.fn = window.fn || {
	'md5' : function () {
		// populated at bottom of file
	},

	/**
	 * Iterate through an array or object.
	 */
	'each' : function( obj, row_callback ) {
		if ( typeof obj != 'object' || obj === null ) {
			throw 'each: Invalid object supplied.';
		}
		if ( typeof row_callback != 'function' ) {
			throw 'each: Invalid row_callback function supplied.';
		}
		if ( obj.constructor == Array ) {
			for ( var i=0; i<obj.length; i++ ) {
				row_callback.call(null, i, obj[i]);
			}
		} else if ( obj.constructor == Object ) {
			for ( var k in obj ) {
				row_callback.call(null, k, obj[k]);
			}
		}

		return true;
	},

	'isNumeric' : function (value) {
		return ((typeof value == 'number' || typeof value == 'float' || typeof value == 'decimal') && (!isNaN(value)));
	},

	'isObject' : function (value) {
		return (!fn.empty(value) && typeof value == 'object');
	},

	'empty' : function (value) {
		return (typeof value == 'undefined' || typeof value == 'null' || value === null || value === '' || value === false);
	},
	
	/**
	 * Vertically-centers a DOM object. By default, it will center the object within its parent. If you specify
	 * a value for 'relative_object', it will vertically-center it relative to that.
	 */
	'vcenter' : function( dom_object, relative_object ) {
		if ( typeof relative_object == 'undefined' ) {
			// Relative to Parent
			var parent = $(dom_object).parent();
			var parent_outer_height = $(parent).outerHeight();
			var dom_obj_outer_height = $(dom_object).outerHeight();
			var center_pos = Math.floor(( parent_outer_height - dom_obj_outer_height ) / 2);
			$(dom_object).css({
				top : center_pos
			});
		}
	},

	'strpos' : function( haystack, needle, offset ) {
	  var i = (haystack+'').indexOf(needle, (offset || 0));
	  return i === -1 ? false : i;
	},

	/**
	 * Accepts a string that contains HTML entities. Un-entities dem guise. Uses the magical powers of a random DOM element to make all teh dreams come true.
	 * Borrowed from: http://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript
	 */
	'html_decode': function (encoded_string) {
		var spare_element = document.createElement('div');

		spare_element.innerHTML = encoded_string;

		return spare_element.firstChild.nodeValue;
	},

	'microtime' : function( get_as_float ) {
		// http://kevin.vanzonneveld.net
		// +   original by: Paulo Freitas
		// *     example 1: timeStamp = microtime(true);
		// *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
		var now = new Date().getTime() / 1000;
		var s = parseInt(now, 10);
		return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
	},

	'generate_random_string' : function() {
		return fn.generateRandomString(arguments);
	},

	'addCommas' : function(nStr) {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	},

	// Logic copy from sec2time in functions.inc.php
	// Added by Daniel
	'sec2time' : function(sec){
		var duration = '';
		var durMin = Math.floor(sec / 60);
		var durSec = sec % 60;
		if(durSec < 10){
			durSec = '0'+durSec;
		} 
		if(durMin >= 60){
			var durHr = Math.floor(durMin / 60);
			durMin = durMin % 60;
			if(durMin < 10){
				durMin = '0'+durMin;
			}
			duration = durHr+":"+durMin+":"+durSec;
		}else{
			duration = durMin+":"+durSec;
		}
		return duration;
	},

};

fn.number_format = function(number, decimals, dec_point, thousands_sep) {
    // Strip all characters but numerical ones.
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
};

fn.getQueryStringParam = function(name, string) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	if (typeof(string) != "undefined" && string.length > 0) {
		var results = regex.exec(string);
	} else {
		var results = regex.exec(location.search);
	}
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

fn.trim = function( str, charlist ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: mdsjack (http://www.mdsjack.bo.it)
    // +   improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
    // +      input by: Erkekjetter
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: DxGx
    // +   improved by: Steven Levithan (http://blog.stevenlevithan.com)
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // *     example 1: trim('    Kevin van Zonneveld    ');
    // *     returns 1: 'Kevin van Zonneveld'
    // *     example 2: trim('Hello World', 'Hdle');
    // *     returns 2: 'o Wor'
    // *     example 3: trim(16, 1);
    // *     returns 3: 6
    var whitespace, l = 0,
        i = 0;
    str += '';

    if (!charlist) {
        // default list
        whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
    } else {
        // preg_quote custom list
        charlist += '';
        whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
    }

    l = str.length;
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i);
            break;
        }
    }

    l = str.length;
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1);
            break;
        }
    }

    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
};

fn.dater = function( format, date_string ) {
	return fn.date(format, fn.strtotime(date_string));
};

fn.inArray = function( needle, haystack ) {
	if ( haystack.indexOf(needle) === -1 ) {
		return false;
	} else {
		return true;
	}
};

fn.max = function( array ){
    return Math.max.apply( Math, array );
};

fn.gmdate = function(format, timestamp) {
    // http://kevin.vanzonneveld.net
    // +   original by: Brett Zamir (http://brett-zamir.me)
    // +   input by: Alex
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // -    depends on: date
    // *     example 1: gmdate('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400); // Return will depend on your timezone
    // *     returns 1: '07:09:40 m is month'
    var dt = typeof timestamp === 'undefined' ? new Date() : // Not provided
			typeof timestamp === 'object' ? new Date(timestamp) : // Javascript Date()
			new Date(timestamp * 1000); // UNIX timestamp (auto-convert to int)
    timestamp = Date.parse(dt.toUTCString().slice(0, -4)) / 1000;
    return this.date(format, timestamp);
};

fn.date = function(format, timestamp) {
    // http://kevin.vanzonneveld.net
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +      parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: MeEtc (http://yass.meetcweb.com)
    // +   improved by: Brad Touesnard
    // +   improved by: Tim Wiel
    // +   improved by: Bryan Elliott
    //
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: David Randall
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +  derived from: gettimeofday
    // +      input by: majak
    // +   bugfixed by: majak
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Alex
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Thomas Beaucourt (http://www.webapp.fr)
    // +   improved by: JT
    // +   improved by: Theriault
    // +   improved by: Rafał Kukawski (http://blog.kukawski.pl)
    // +   bugfixed by: omid (http://phpjs.org/functions/380:380#comment_137122)
    // +      input by: Martin
    // +      input by: Alex Wilson
    // +   bugfixed by: Chris (http://www.devotis.nl/)
    // %        note 1: Uses global: php_js to store the default timezone
    // %        note 2: Although the function potentially allows timezone info (see notes), it currently does not set
    // %        note 2: per a timezone specified by date_default_timezone_set(). Implementers might use
    // %        note 2: this.php_js.currentTimezoneOffset and this.php_js.currentTimezoneDST set by that function
    // %        note 2: in order to adjust the dates in this function (or our other date functions!) accordingly
    // *     example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
    // *     returns 1: '09:09:40 m is month'
    // *     example 2: date('F j, Y, g:i a', 1062462400);
    // *     returns 2: 'September 2, 2003, 2:26 am'
    // *     example 3: date('Y W o', 1062462400);
    // *     returns 3: '2003 36 2003'
    // *     example 4: x = date('Y m d', (new Date()).getTime()/1000);
    // *     example 4: (x+'').length == 10 // 2009 01 09
    // *     returns 4: true
    // *     example 5: date('W', 1104534000);
    // *     returns 5: '53'
    // *     example 6: date('B t', 1104534000);
    // *     returns 6: '999 31'
    // *     example 7: date('W U', 1293750000.82); // 2010-12-31
    // *     returns 7: '52 1293750000'
    // *     example 8: date('W', 1293836400); // 2011-01-01
    // *     returns 8: '52'
    // *     example 9: date('W Y-m-d', 1293974054); // 2011-01-02
    // *     returns 9: '52 2011-01-02'
    var that = this,
        jsdate, f, formatChr = /\\?([a-z])/gi,
        formatChrCb,
        // Keep this here (works, but for code commented-out
        // below for file size reasons)
        //, tal= [],
        _pad = function (n, c) {
            if ((n = n + '').length < c) {
                return new Array((++c) - n.length).join('0') + n;
            }
            return n;
        },
        txt_words = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    formatChrCb = function (t, s) {
        return f[t] ? f[t]() : s;
    };
    f = {
        // Day
        d: function () { // Day of month w/leading 0; 01..31
            return _pad(f.j(), 2);
        },
        D: function () { // Shorthand day name; Mon...Sun
            return f.l().slice(0, 3);
        },
        j: function () { // Day of month; 1..31
            return jsdate.getDate();
        },
        l: function () { // Full day name; Monday...Sunday
            return txt_words[f.w()] + 'day';
        },
        N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
            return f.w() || 7;
        },
        S: function () { // Ordinal suffix for day of month; st, nd, rd, th
            var j = f.j();
            return j < 4 | j > 20 && ['st', 'nd', 'rd'][j%10 - 1] || 'th';
        },
        w: function () { // Day of week; 0[Sun]..6[Sat]
            return jsdate.getDay();
        },
        z: function () { // Day of year; 0..365
            var a = new Date(f.Y(), f.n() - 1, f.j()),
                b = new Date(f.Y(), 0, 1);
            return Math.round((a - b) / 864e5) + 1;
        },

        // Week
        W: function () { // ISO-8601 week number
            var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
                b = new Date(a.getFullYear(), 0, 4);
            return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
        },

        // Month
        F: function () { // Full month name; January...December
            return txt_words[6 + f.n()];
        },
        m: function () { // Month w/leading 0; 01...12
            return _pad(f.n(), 2);
        },
        M: function () { // Shorthand month name; Jan...Dec
            return f.F().slice(0, 3);
        },
        n: function () { // Month; 1...12
            return jsdate.getMonth() + 1;
        },
        t: function () { // Days in month; 28...31
            return (new Date(f.Y(), f.n(), 0)).getDate();
        },

        // Year
        L: function () { // Is leap year?; 0 or 1
            var j = f.Y();
            return j%4 === 0 & j%100 !== 0 | j%400 === 0;
        },
        o: function () { // ISO-8601 year
            var n = f.n(),
                W = f.W(),
                Y = f.Y();
            return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
        },
        Y: function () { // Full year; e.g. 1980...2010
            return jsdate.getFullYear();
        },
        y: function () { // Last two digits of year; 00...99
            return (f.Y() + "").slice(-2);
        },

        // Time
        a: function () { // am or pm
            return jsdate.getHours() > 11 ? "pm" : "am";
        },
        A: function () { // AM or PM
            return f.a().toUpperCase();
        },
        B: function () { // Swatch Internet time; 000..999
            var H = jsdate.getUTCHours() * 36e2,
                // Hours
                i = jsdate.getUTCMinutes() * 60,
                // Minutes
                s = jsdate.getUTCSeconds(); // Seconds
            return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
        },
        g: function () { // 12-Hours; 1..12
            return f.G() % 12 || 12;
        },
        G: function () { // 24-Hours; 0..23
            return jsdate.getHours();
        },
        h: function () { // 12-Hours w/leading 0; 01..12
            return _pad(f.g(), 2);
        },
        H: function () { // 24-Hours w/leading 0; 00..23
            return _pad(f.G(), 2);
        },
        i: function () { // Minutes w/leading 0; 00..59
            return _pad(jsdate.getMinutes(), 2);
        },
        s: function () { // Seconds w/leading 0; 00..59
            return _pad(jsdate.getSeconds(), 2);
        },
        u: function () { // Microseconds; 000000-999000
            return _pad(jsdate.getMilliseconds() * 1000, 6);
        },

        // Timezone
        e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
            // The following works, but requires inclusion of the very large
            // timezone_abbreviations_list() function.
/*              return that.date_default_timezone_get();
*/
            throw 'Not supported (see source code of date() for timezone on how to add support)';
        },
        I: function () { // DST observed?; 0 or 1
            // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
            // If they are not equal, then DST is observed.
            var a = new Date(f.Y(), 0),
                // Jan 1
                c = Date.UTC(f.Y(), 0),
                // Jan 1 UTC
                b = new Date(f.Y(), 6),
                // Jul 1
                d = Date.UTC(f.Y(), 6); // Jul 1 UTC
            return 0 + ((a - c) !== (b - d));
        },
        O: function () { // Difference to GMT in hour format; e.g. +0200
            var tzo = jsdate.getTimezoneOffset(),
                a = Math.abs(tzo);
            return (tzo > 0 ? "-" : "+") + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
        },
        P: function () { // Difference to GMT w/colon; e.g. +02:00
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2));
        },
        T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
            // The following works, but requires inclusion of the very
            // large timezone_abbreviations_list() function.
/*              var abbr = '', i = 0, os = 0, default = 0;
            if (!tal.length) {
                tal = that.timezone_abbreviations_list();
            }
            if (that.php_js && that.php_js.default_timezone) {
                default = that.php_js.default_timezone;
                for (abbr in tal) {
                    for (i=0; i < tal[abbr].length; i++) {
                        if (tal[abbr][i].timezone_id === default) {
                            return abbr.toUpperCase();
                        }
                    }
                }
            }
            for (abbr in tal) {
                for (i = 0; i < tal[abbr].length; i++) {
                    os = -jsdate.getTimezoneOffset() * 60;
                    if (tal[abbr][i].offset === os) {
                        return abbr.toUpperCase();
                    }
                }
            }
*/
            return 'UTC';
        },
        Z: function () { // Timezone offset in seconds (-43200...50400)
            return -jsdate.getTimezoneOffset() * 60;
        },

        // Full Date/Time
        c: function () { // ISO-8601 date.
            return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
        },
        r: function () { // RFC 2822
            return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
        },
        U: function () { // Seconds since UNIX epoch
            return jsdate / 1000 | 0;
        }
    };

    this.date = function (format, timestamp) {
        var that = this;

		if (timestamp === null) {
			jsdate = new Date();
		}
		else {
			if (timestamp instanceof Date) {
				jsdate = new Date(timestamp);
			}
			else {
				jsdate = new Date(timestamp * 1000);
			}
		}

        return format.replace(formatChr, formatChrCb);
    };

    return this.date(format, timestamp);
};

fn.getParamNames = function(func) {
    var funStr = func.toString();
    return funStr.slice(funStr.indexOf('(')+1, funStr.indexOf(')')).match(/([^\s,]+)/g);
};

fn.strtotime = function(str, now) {
    // http://kevin.vanzonneveld.net
    // +   original by: Caio Ariede (http://caioariede.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: David
    // +   improved by: Caio Ariede (http://caioariede.com)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Wagner B. Soares
    // +   bugfixed by: Artur Tchernychev
    // +   input by: wookie
    // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
    // *     example 1: strtotime('+1 day', 1129633200);
    // *     returns 1: 1129719600
    // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
    // *     returns 2: 1130425202
    // *     example 3: strtotime('last month', 1129633200);
    // *     returns 3: 1127041200
    // *     example 4: strtotime('2009-05-04 08:30:00');
    // *     returns 4: 1241418600
    var i, l, match, s, parse = '';

    str = (str + '').replace(/\s{2,}|^\s|\s$/g, ' ').replace(/[\t\r\n]/g, ''); // unecessary spaces and chars

    if (str === 'now') {
        return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0;
    } else if (!isNaN(parse = Date.parse(str))) {
        return parse / 1000 | 0;
    } else if (now) {
        now = new Date(now * 1000); // Accept PHP-style seconds
    } else {
        now = new Date();
    }

    str = str.toLowerCase();

    var __is = {
        day: {
            'sun': 0,
            'mon': 1,
            'tue': 2,
            'wed': 3,
            'thu': 4,
            'fri': 5,
            'sat': 6
        },
        mon: [
            'jan',
            'feb',
            'mar',
            'apr',
            'may',
            'jun',
            'jul',
            'aug',
            'sep',
            'oct',
            'nov',
            'dec'
        ]
    };

    var process = function (m) {
        var ago = (m[2] && m[2] === 'ago');
        var num = (num = m[0] === 'last' ? -1 : 1) * (ago ? -1 : 1);

        switch (m[0]) {
        case 'last':
        case 'next':
            switch (m[1].substring(0, 3)) {
            case 'yea':
                now.setFullYear(now.getFullYear() + num);
                break;
            case 'wee':
                now.setDate(now.getDate() + (num * 7));
                break;
            case 'day':
                now.setDate(now.getDate() + num);
                break;
            case 'hou':
                now.setHours(now.getHours() + num);
                break;
            case 'min':
                now.setMinutes(now.getMinutes() + num);
                break;
            case 'sec':
                now.setSeconds(now.getSeconds() + num);
                break;
            case 'mon':
                if (m[1] === "month") {
                    now.setMonth(now.getMonth() + num);
                    break;
                }
                // fall through
            default:
                var day = __is.day[m[1].substring(0, 3)];
                if (typeof day !== 'undefined') {
                    var diff = day - now.getDay();
                    if (diff === 0) {
                        diff = 7 * num;
                    } else if (diff > 0) {
                        if (m[0] === 'last') {
                            diff -= 7;
                        }
                    } else {
                        if (m[0] === 'next') {
                            diff += 7;
                        }
                    }
                    now.setDate(now.getDate() + diff);
                    now.setHours(0, 0, 0, 0); // when jumping to a specific last/previous day of week, PHP sets the time to 00:00:00
                }

            	break;
            }

        default:
            if (/\d+/.test(m[0])) {
                num *= parseInt(m[0], 10);

                switch (m[1].substring(0, 3)) {
                case 'yea':
                    now.setFullYear(now.getFullYear() + num);
                    break;
                case 'mon':
                    now.setMonth(now.getMonth() + num);
                    break;
                case 'wee':
                    now.setDate(now.getDate() + (num * 7));
                    break;
                case 'day':
                    now.setDate(now.getDate() + num);
                    break;
                case 'hou':
                    now.setHours(now.getHours() + num);
                    break;
                case 'min':
                    now.setMinutes(now.getMinutes() + num);
                    break;
                case 'sec':
                    now.setSeconds(now.getSeconds() + num);
                    break;

				default:
					break;
                }
            } else {
                return false;
            }
            break;
        }
        return true;
    };

    match = str.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);
    if (match !== null) {
        if (!match[2]) {
            match[2] = '00:00:00';
        } else if (!match[3]) {
            match[2] += ':00';
        }

        s = match[1].split(/-/g);

        s[1] = __is.mon[s[1] - 1] || s[1];
        s[0] = +s[0];

        s[0] = (s[0] >= 0 && s[0] <= 69) ? '20' + (s[0] < 10 ? '0' + s[0] : s[0] + '') : (s[0] >= 70 && s[0] <= 99) ? '19' + s[0] : s[0] + '';
        return parseInt(this.strtotime(s[2] + ' ' + s[1] + ' ' + s[0] + ' ' + match[2]) + (match[4] ? match[4] / 1000 : ''), 10);
    }

    var regex = '([+-]?\\d+\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)' + '|(last|next)\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))' + '(\\sago)?';

    match = str.match(new RegExp(regex, 'gi')); // Brett: seems should be case insensitive per docs, so added 'i'
    if (match === null) {
        return false;
    }

    for (i = 0, l = match.length; i < l; i++) {
        if (!process(match[i].split(' '))) {
            return false;
        }
    }

    return now.getTime() / 1000 | 0;
};

fn.array_chunk = function( input, size, preserve_keys ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // %        note 1: Important note: Per the ECMAScript specification, objects may not always iterate in a predictable order
    // *     example 1: array_chunk(['Kevin', 'van', 'Zonneveld'], 2);
    // *     returns 1: [['Kevin', 'van'], ['Zonneveld']]
    // *     example 2: array_chunk(['Kevin', 'van', 'Zonneveld'], 2, true);
    // *     returns 2: [{0:'Kevin', 1:'van'}, {2: 'Zonneveld'}]
    // *     example 3: array_chunk({1:'Kevin', 2:'van', 3:'Zonneveld'}, 2);
    // *     returns 3: [['Kevin', 'van'], ['Zonneveld']]
    // *     example 4: array_chunk({1:'Kevin', 2:'van', 3:'Zonneveld'}, 2, true);
    // *     returns 4: [{1: 'Kevin', 2: 'van'}, {3: 'Zonneveld'}]

    var x, p = '', i = 0, c = -1, l = input.length || 0, n = [];

    if (size < 1) {
        return null;
    }

    if (Object.prototype.toString.call(input) === '[object Array]') {
        if (preserve_keys) {
            while (i < l) {
                (x = i % size) ? n[c][i] = input[i] : n[++c] = {};
				n[c][i] = input[i];
                i++;
            }
        }
        else {
            while (i < l) {
                (x = i % size) ? n[c][x] = input[i] : n[++c] = [input[i]];
                i++;
            }
        }
    }
    else {
        if (preserve_keys) {
            for (p in input) {
                if (input.hasOwnProperty(p)) {
                    (x = i % size) ? n[c][p] = input[p] : n[++c] = {};
					n[c][p] = input[p];
                    i++;
                }
            }
        }
        else {
            for (p in input) {
                if (input.hasOwnProperty(p)) {
                    (x = i % size) ? n[c][x] = input[p] : n[++c] = [input[p]];
                    i++;
                }
            }
        }
    }
    return n;
};

/**
 * Formats a number to use the appropriate suffix.  (i.e. 1,000 = 1K, 1,000,000 = 1M, 1,000,000,000 = 1G)
 * @num - Number - The number to format
 */
fn.nFormatter = function( n, suffix ) {

	if(n === null || _.isUndefined(n)){
		return null;
	}

	if (!_.isNumber(n)) {
		n = Number(n.replace(/[^\d.]/g, ''));
	}

    if (n >= 1000000000) {
    	suffix = (suffix) ? 'B' : '';
        return (n / 1000000000).toFixed(1).replace(/\.0$/, '') + suffix;
    }
    if (n >= 1000000) {
    	suffix = (suffix) ? 'M' : '';
        return (n / 1000000).toFixed(1).replace(/\.0$/, '') + suffix;
    }
    if (n >= 1000) {
    	suffix = (suffix) ? 'K' : '';
        return (n / 1000).toFixed(1).replace(/\.0$/, '') + suffix;
    }

    return n;

};

/**
 * Converts Hex color code (FF0000) to RGB 255, 0, 0
 */
fn.convertHexToRGB = function( hexColor) {

	R = hexToR(hexColor);
	G = hexToG(hexColor);
	B = hexToB(hexColor);

	function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16);}
	function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16);}
	function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16);}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h;}

	return R + ', ' + G + ', ' + B;
};

/**
 * Converts RGB values (255,0,0) to Hex value (FF0000)
 */
fn.converRgbToHex = function( rgbColor ) {

	var color = rgbColor.split(',');
	return toHex(color[0]) + toHex(color[1]) + toHex(color[2]);

	function toHex(n) {
		n = parseInt(n,10);
	 	if (isNaN(n)) return "00";
	 	n = Math.max(0,Math.min(n,255));
	 	return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
	}
};


fn.RGBToHex = function ( R, G, B ) {

	return toHex(R)+toHex(G)+toHex(B);

	function toHex(n) {
 		n = parseInt(n,10);
 		if (isNaN(n)) return "00";
 		n = Math.max(0,Math.min(n,255));
 		return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
 	}
};

/*
 * Creates a pseudo wordwrap for particularly long strings
 */
fn.wordwrap = function( str, width, brk, cut ) {

    brk = brk || '\n';
    width = width || 75;
    cut = cut || false;

    if (!str) { return str; }

    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');

    return str.match( RegExp(regex, 'g') ).join( brk );

};

/*
 * nl2br
 */
fn.nl2br = function ( str, is_xhtml ) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

fn.entities = function (str) {
	var holder = $('<div />'),
		result = '';

	holder.text(str);

	result = holder.html();
	result = result.replace(/'/g, '&rsquo;').replace(/"/g, '&rdquo;');

	return result;
};

if (typeof Url !== 'undefined') {
	fn.current_url = new Url();
}


/*
 * format of every Url:
 * "scheme://prefix.domain:port/path/filename"
 *
 * scheme - defines the type of Internet service (most common is http or https)
 * prefix - defines a domain prefix (default for http is www)
 * domain - defines the Internet domain name (like w3schools.com)
 * port - defines the port number at the host (default for http is 80)
 * path - defines a path at the server (If omitted: the root directory of the site)
 * filename - defines the name of a document or resource
 *
 */
// use alert for warning popups
alert = chrome.extension.getBackgroundPage().alert;

function Url_Formatter() {
    this.url_requester = new Url_Requester();

    this.stripOfFinalSlash = function (url) {
        if (url[url.length - 1] == '/') {
            var ans = url.split("");
            ans.pop();
            url = ans.join("");
        }
        return url;
    };

    this.stripOfScheme = function (url) {
        var schemeless = url;
        if (url.indexOf("://") > -1) {
            schemeless = url.split('://')[1];
        }
        schemeless = this.stripOfFinalSlash(schemeless);
        return schemeless;
    };

    this.stripOfPort = function (url) {
        var portless = [];
        if (url.indexOf(":") > -1) {
            var splittedUrl = url.split(':');
            portless.push(splittedUrl[0]);
            splittedUrl.shift();
            splittedUrl = splittedUrl[0].split('/');
            splittedUrl.shift();
            splittedUrl = splittedUrl.join('/');
            portless.push('/' + splittedUrl + '/');
            url = portless.join("");
        }
        url = this.stripOfFinalSlash(url);
        return url;
    };

    this.stripOfFileName = function (url) {
        if (url.indexOf("/") > -1) {
            var nameless = url.split("").reverse().join("");
            nameless = nameless.split(['/']);
            var stripped = [];
            for (var i = 1; i < nameless.length; i++) {
                stripped.push('/');
                stripped.push(nameless[i]);
            }
            stripped = stripped.join("").split("").reverse().join("");
            stripped = this.stripOfFinalSlash(stripped);
            return stripped;
        } else {
            url = this.stripOfFinalSlash(url);
            return url;
        }
    };

    this.getDomainOnly = function (url) {
        if (url.indexOf("/") > -1) {
            return url.split("/")[0];
        } else {
            return url;
        }
    };

    this.stripOfAll = function (url) {
        url = this.stripOfScheme(url);
        url = this.stripOfFinalSlash(url);
        url = this.stripOfPort(url);
        url = this.stripOfFileName(url);
        url = this.stripOfFinalSlash(url);
        //return a tuple of the actual url and only the =: "www.website.com"
        return [url, this.getDomainOnly(url)];
    };

    this.formatForGetRequest = function (url) {
        var strippedUrl = this.stripOfAll(url);
        return "http://" + strippedUrl[0];
    };

    this.getUrlFromServer = function (url, callback) {
        var urlToGet = this.formatForGetRequest(url);
        this.url_requester.httpGetAsync(urlToGet, function(url, title) {
            url = url_formatter.stripOfScheme(url);
            url = url_formatter.stripOfFileName(url);
            callback(url, title);
        });
    };

}

function Url_Requester() {
    INVALID_URL_MESSAGE = "We unfortunately could not reach the site you are trying to block.\n" +
        "Are you sure the url is correct? \n \n";

    var self = this;

    //Fire a request for the actual url from server. Then go on to fire the passed callback with the newly found url
    this.httpGetAsync = function (theUrlToGet, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrlToGet, true); // true for asynchronous
        xmlHttp.onreadystatechange = function () {
            // on succesful request, return responseURL
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                // simple regex to extract data from title tags, ignoring newlines, tabs and returns
                var titleTags = (/<title.*?>(?:[\t\n\r]*)(.*?)(?:[\t\n\r]*)<\/title>/m).exec(xmlHttp.responseText);
                if (titleTags != null) {
                    var title = titleTags[1];
                    callback(xmlHttp.responseURL, title);
                } else {
                    callback(xmlHttp.responseURL, theUrlToGet);
                }
            }
        };
        xmlHttp.onerror = this.errorHandler;
        xmlHttp.send(null);
    };

    this.errorHandler = function(status) {
        switch (status) {
            case 404:
                alert(INVALID_URL_MESSAGE + 'File not found');
                break;
            case 500:
                alert(INVALID_URL_MESSAGE + 'Server error');
                break;
            case 0:
                alert(INVALID_URL_MESSAGE + 'Request aborted');
                break;
            default:
                alert(INVALID_URL_MESSAGE + 'Unknown error ' + status);
        }
    };
}

var url_formatter = new Url_Formatter();
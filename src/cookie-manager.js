import _ from 'lodash';
import cookie from 'cookie';

const hasDocumentCookie = () => {
    let result = false;
    if (_.isObject(document) && _.isString(document.cookie)) {
        result = true;
    }
    return result;
};

const parseJsonOrReturnString = (str) => {
    let result;
    try {
        result = JSON.parse(str);
    } catch (e) {
        if (e instanceof SyntaxError) {
            result = str;
        } else {
            result = e;
        }
    }
    return result;
};

export default class CookieManager {

    // TODO: perhaps make CookieManager a singleton class
    // TODO: determine whether util functions merit own utils file

    constructor() {
        this.hasDocumentCookie = hasDocumentCookie();
        this._cookies = {};
        this.refreshCookies();
    }

    get cookies() {
        this.refreshCookies();
        let result = {};
        _.forIn(this._cookies, (cookieValue, cookieKey) => {
            result[cookieKey] = this.get(cookieKey);
        });
        return result;
    }

    get(name) {
        this.refreshCookies();
        return parseJsonOrReturnString(this._cookies[name]);
    }

    set(name, value, options) {
        if (_.isObject(value)) {
            value = JSON.stringify(value);
        }
        if (this.hasDocumentCookie) {
            document.cookie = cookie.serialize(name, value, options);
        }
        this.refreshCookies();
    }

    remove(name, options) {
        options = {
            ...options,
            maxAge: 0
        };

        delete this._cookies[name];

        if (this.hasDocumentCookie) {
            document.cookie = cookie.serialize(name, '', options);
        }
    }

    refreshCookies() {
        if (this.hasDocumentCookie) {
            this._cookies = cookie.parse(document.cookie);
        }
    }
}

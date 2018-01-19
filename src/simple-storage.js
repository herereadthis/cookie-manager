import _ from 'lodash';

let _localStorage = new WeakMap();
let _sessionStorage = new WeakMap();

const GET_SESSION_STORAGE = 'getSessionStorage';
const LOCAL_STORAGE_SESSION_KEY = 'sessionStorage';
const TOKEN_KEY = 'token';

const mapStorage = (storageObj) => {
    let storageResult = {};

    _.forIn(storageObj, (storageValue, storageKey) => {
        if (!_.isFunction(storageValue) && storageKey !== 'length') {
        storageResult[storageKey] = BrowserStorage.parseJsonOrReturnString(storageValue);
    }
});

    return storageResult;
};

const setLocalStorageValue = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
};

const setSessionStorageValue = (name, value) => {
    sessionStorage.setItem(name, JSON.stringify(value));
};

export default class BrowserStorage {

    constructor() {
        console.log('new instance of BrowserStorage() created.')
        _localStorage.set(this, {});
        _sessionStorage.set(this, {});
        this.refreshStorage();

        if (_.isNil(this.sessionStorage.get(TOKEN_KEY))) {
            this.localStorage.set(GET_SESSION_STORAGE, Date.now());
        }

        // window.addEventListener('storage', (event) => {
        //     if (event.key === GET_SESSION_STORAGE) {
        //         console.log(3);
        //         this.localStorage.set(LOCAL_STORAGE_SESSION_KEY, _.omit(this.sessionStorage, ['get', 'set', 'remove']));
        //         this.localStorage.remove(LOCAL_STORAGE_SESSION_KEY);
        //     } else if (event.key === LOCAL_STORAGE_SESSION_KEY && _.isNil(this.sessionStorage.get(TOKEN_KEY))) {
        //         console.log(4);
        //         let data = BrowserStorage.parseJsonOrReturnString(event.newValue);
        //         _.forIn(data, (value, key) => {
        //             this.sessionStorage.set(key, value);
        //         });
        //     }
        // });
    }

    static parseJsonOrReturnString(str) {
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
    }

    get hasSessionStorageSet() {
        return _.isNil(this.sessionStorage.get(GET_SESSION_STORAGE));
    }

    get localStorage() {
        this.refreshLocalStorage();
        return {
                get: (name) => {
                return _localStorage.get(this)[name];
    },
        set: (name, value) => {
            setLocalStorageValue(name, value);
            this.refreshLocalStorage();
        },
        remove: (name) => {
            localStorage.removeItem(name);
            this.refreshLocalStorage();
        },
    ..._localStorage.get(this)
    }
    }

    get sessionStorage() {
        this.refreshSessionStorage();
        return {
                get: (name) => {
                return _sessionStorage.get(this)[name];
    },
        set: (name, value) => {
            setSessionStorageValue(name, value);
            this.refreshSessionStorage();
        },
        remove: (name) => {
            sessionStorage.removeItem(name);
            this.refreshSessionStorage();
        },
    ..._sessionStorage.get(this)
    }
    }

    refreshStorage() {
        this.refreshLocalStorage();
        this.refreshSessionStorage();
    }

    refreshLocalStorage() {
        _localStorage.set(this, mapStorage(localStorage));
    }

    refreshSessionStorage() {
        _sessionStorage.set(this, mapStorage(sessionStorage));
    }
}

import firebase from "./fire";

/* global chrome */
let listeners = [];
let study = "newTestRun";
let uId = "3";

export function getFromStorage(...keys) {
    return new Promise(resolve => {
        if (window.chrome && chrome.storage) {
            chrome.storage.sync.get(keys, result => {
                resolve(result);
            });
        } else {
            let result = keys.reduce((acc, val) => {
                try {
                    acc[val] = JSON.parse(localStorage.getItem(val));
                } catch (e) {
                    // too bad, could not retrieve this value. fail safe.
                    // the value is probably invalid json for some reason,
                    // such as 'undefined'.
                }
                return acc;
            }, {});

            resolve(result);
        }
    });
}

export function setInStorage(items) {
    return new Promise(async resolve => {
        if (!items) return resolve();

        await setFirebaseData(items);
        
        if (window.chrome && chrome.storage) {
            chrome.storage.sync.set(items, () => {
                resolve();
            });
        } else {
            Object.keys(items).forEach(key => {
                // don't store null or undefined values.
                if (items[key] === undefined || !items[key] === null) {
                    return;
                }

                localStorage.setItem(key, JSON.stringify(items[key]));
            });
            listeners.forEach(callback => callback());

            resolve();
        }
    });
}

export const addStorageListener = callback => {
    if (window.chrome && chrome.storage) {
        chrome.storage.onChanged.addListener(callback);
    } else {
        listeners.push(callback);
        window.addEventListener('storage', callback); // only for external tab
    }
};

export function setFirebaseData(items) {
    return new Promise(async resolve => {
        if(!items) return resolve();

        Object.keys(items).forEach( async key => {
            await firebase.firestore().collection(study).doc(uId).update({
                [key]: items[key]
            });
        })
        resolve();
    })
}

export function firstTimeRunStorage() {
    return new Promise(async resolve => {
            await firebase.firestore().collection(study).doc(uId).set({
            }).catch(console.error);
            resolve();
    });
}
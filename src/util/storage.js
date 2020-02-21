import firebase from "./fire";

/* global chrome */
let listeners = [];
let study = "testRun";
let uId = "2";

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
        return new Promise(resolve => {
        if (!items) return resolve();

        //Datastructure is a map
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

export function firstTimeRunStorage(userId) {
    uId = userId;
    return new Promise(async resolve => {
            await firebase.firestore().collection(study).doc(uId).set({
                "enabled": ""
            }).catch(console.error);
            resolve();
    });
}

//      firebase.firestore.FieldValue.arrayUnion() -- Adding to an array
//      firebase.firestore.FieldValue.arrayRemove() -- Removing from an array
/*
    await firebase.firestore().collection("test3").doc("2").set({
        "newfield":[2],
        "time":5
    }).catch(console.error); 
    
    
    
    const fecthData = async () => {
            const db = firebase.firestore()
            const snapshot = await db.collection("test").get().catch(console.error);
            if(!snapshot) return "no data";
            const  docs = snapshot.docs;
            docs.forEach((doc)=>{
                console.log(doc.data());
    })

        }*/
/* global chrome */
import Autolinker from 'autolinker';
import * as UrlParser from 'url-parse';
import { message } from 'antd';

let listeners = [];

function getFromStorage(...keys) {
    return new Promise(resolve => {
        if (chrome && chrome.storage) {
            chrome.storage.sync.get(keys, result => {
                resolve(result);
            });
        } else {
            let result = keys.reduce((acc, val) => {
                acc[val] = JSON.parse(localStorage.getItem(val));
                return acc;
            }, {});

            resolve(result);
        }
    });
}

function setInStorage(items) {
    return new Promise(resolve => {
        if (chrome && chrome.storage) {
            chrome.storage.sync.set(items, () => {
                resolve();
            });
        } else {
            Object.keys(items).forEach(key => {
                localStorage.setItem(key, JSON.stringify(items[key]));
            });
            listeners.forEach(callback => callback());

            resolve();
        }
});
}

export function getWebsites() {
    return getFromStorage('blockedUrls').then(res => res.blockedUrls || []);
}

export const blockCurrentWebsite = () => {
    if (!(chrome && chrome.tabs)) return; // no chrome env.
  
    chrome.tabs.getSelected(null, function(tab) {
      blockWebsite(tab.url);
    });
}

export const blockWebsite = (url) => {
    let matches = Autolinker.parse(url, {
      urls: true,
      email: true
    });
  
    if (!matches.length) return message.error('No valid link.');
  
    let urls = matches.map(urlToParser);
  
    getWebsites().then(blockedUrls => {
        let notBlocked = url => {
            return !blockedUrls.find(blocked => blocked.regex === url.regex);
        };
        let regexed = urls.map(mapToBlockedUrl);
        let blocked = [];
        regexed.forEach(item => {
            if (notBlocked(item)) {
                blockedUrls.push(item)
                blocked.push(item);
            };
        });
        
        return setInStorage({ blockedUrls }).then(() => {
            if (blocked.length > 1) {
                message.success(`Blocked ${blocked.length} websites`); 
            } else {
                message.success(`Blocked ${blocked[0].hostname}`);
            }
        });
    });
}

export const unblockWebsite = (hostname) => {
    getWebsites().then(oldBlockedUrls => {
        let blockedUrls = oldBlockedUrls.filter(blockedUrl => 
            blockedUrl.hostname !== hostname);

        return setInStorage({ blockedUrls });
    }).then(() => message.success(`Unblocked ${hostname}`));
};

export const addStorageListener = callback => {
    if (!(chrome && chrome.storage)) {
        listeners.push(callback);
        window.addEventListener('storage', callback); // only for external tab
    } else {
        chrome.storage.onChanged.addListener(callback);
    }
};

export const appEnabled = callback => {

}

// utility functions
function urlToParser(match) {
  let url = match.getUrl();
  let parser = new UrlParser(url);
  return parser;
}

function mapToBlockedUrl(parser) {
  let regex = `*://*.${parser.hostname}/*`;
  let { hostname, href, pathname } = parser;

  return {
    hostname,
    href,
    pathname,
    regex
  };
}
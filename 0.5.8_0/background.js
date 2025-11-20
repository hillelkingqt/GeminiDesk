var uc = Object.defineProperty;
var dc = (s, e, r) => e in s ? uc(s, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : s[e] = r;
var B = (s, e, r) => dc(s, typeof e != "symbol" ? e + "" : e, r);
function hc(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var na = { exports: {} }, fc = na.exports, Mn;
function pc() {
  return Mn || (Mn = 1, function (s, e) {
    (function (r, a) {
      a(s);
    })(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : fc, function (r) {
      if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id))
        throw new Error("This script should only be loaded in a browser extension.");
      if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)
        r.exports = globalThis.browser;
      else {
        const a = "The message port closed before a response was received.", t = (n) => {
          const o = {
            alarms: {
              clear: {
                minArgs: 0,
                maxArgs: 1
              },
              clearAll: {
                minArgs: 0,
                maxArgs: 0
              },
              get: {
                minArgs: 0,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            bookmarks: {
              create: {
                minArgs: 1,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getChildren: {
                minArgs: 1,
                maxArgs: 1
              },
              getRecent: {
                minArgs: 1,
                maxArgs: 1
              },
              getSubTree: {
                minArgs: 1,
                maxArgs: 1
              },
              getTree: {
                minArgs: 0,
                maxArgs: 0
              },
              move: {
                minArgs: 2,
                maxArgs: 2
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeTree: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            browserAction: {
              disable: {
                minArgs: 0,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              enable: {
                minArgs: 0,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              getBadgeBackgroundColor: {
                minArgs: 1,
                maxArgs: 1
              },
              getBadgeText: {
                minArgs: 1,
                maxArgs: 1
              },
              getPopup: {
                minArgs: 1,
                maxArgs: 1
              },
              getTitle: {
                minArgs: 1,
                maxArgs: 1
              },
              openPopup: {
                minArgs: 0,
                maxArgs: 0
              },
              setBadgeBackgroundColor: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setBadgeText: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setIcon: {
                minArgs: 1,
                maxArgs: 1
              },
              setPopup: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setTitle: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            browsingData: {
              remove: {
                minArgs: 2,
                maxArgs: 2
              },
              removeCache: {
                minArgs: 1,
                maxArgs: 1
              },
              removeCookies: {
                minArgs: 1,
                maxArgs: 1
              },
              removeDownloads: {
                minArgs: 1,
                maxArgs: 1
              },
              removeFormData: {
                minArgs: 1,
                maxArgs: 1
              },
              removeHistory: {
                minArgs: 1,
                maxArgs: 1
              },
              removeLocalStorage: {
                minArgs: 1,
                maxArgs: 1
              },
              removePasswords: {
                minArgs: 1,
                maxArgs: 1
              },
              removePluginData: {
                minArgs: 1,
                maxArgs: 1
              },
              settings: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            commands: {
              getAll: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            contextMenus: {
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeAll: {
                minArgs: 0,
                maxArgs: 0
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            cookies: {
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 1,
                maxArgs: 1
              },
              getAllCookieStores: {
                minArgs: 0,
                maxArgs: 0
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              set: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            devtools: {
              inspectedWindow: {
                eval: {
                  minArgs: 1,
                  maxArgs: 2,
                  singleCallbackArg: !1
                }
              },
              panels: {
                create: {
                  minArgs: 3,
                  maxArgs: 3,
                  singleCallbackArg: !0
                },
                elements: {
                  createSidebarPane: {
                    minArgs: 1,
                    maxArgs: 1
                  }
                }
              }
            },
            downloads: {
              cancel: {
                minArgs: 1,
                maxArgs: 1
              },
              download: {
                minArgs: 1,
                maxArgs: 1
              },
              erase: {
                minArgs: 1,
                maxArgs: 1
              },
              getFileIcon: {
                minArgs: 1,
                maxArgs: 2
              },
              open: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              pause: {
                minArgs: 1,
                maxArgs: 1
              },
              removeFile: {
                minArgs: 1,
                maxArgs: 1
              },
              resume: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              },
              show: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            extension: {
              isAllowedFileSchemeAccess: {
                minArgs: 0,
                maxArgs: 0
              },
              isAllowedIncognitoAccess: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            history: {
              addUrl: {
                minArgs: 1,
                maxArgs: 1
              },
              deleteAll: {
                minArgs: 0,
                maxArgs: 0
              },
              deleteRange: {
                minArgs: 1,
                maxArgs: 1
              },
              deleteUrl: {
                minArgs: 1,
                maxArgs: 1
              },
              getVisits: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            i18n: {
              detectLanguage: {
                minArgs: 1,
                maxArgs: 1
              },
              getAcceptLanguages: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            identity: {
              launchWebAuthFlow: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            idle: {
              queryState: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            management: {
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              getSelf: {
                minArgs: 0,
                maxArgs: 0
              },
              setEnabled: {
                minArgs: 2,
                maxArgs: 2
              },
              uninstallSelf: {
                minArgs: 0,
                maxArgs: 1
              }
            },
            notifications: {
              clear: {
                minArgs: 1,
                maxArgs: 1
              },
              create: {
                minArgs: 1,
                maxArgs: 2
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              getPermissionLevel: {
                minArgs: 0,
                maxArgs: 0
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            pageAction: {
              getPopup: {
                minArgs: 1,
                maxArgs: 1
              },
              getTitle: {
                minArgs: 1,
                maxArgs: 1
              },
              hide: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setIcon: {
                minArgs: 1,
                maxArgs: 1
              },
              setPopup: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setTitle: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              show: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            permissions: {
              contains: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              request: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            runtime: {
              getBackgroundPage: {
                minArgs: 0,
                maxArgs: 0
              },
              getPlatformInfo: {
                minArgs: 0,
                maxArgs: 0
              },
              openOptionsPage: {
                minArgs: 0,
                maxArgs: 0
              },
              requestUpdateCheck: {
                minArgs: 0,
                maxArgs: 0
              },
              sendMessage: {
                minArgs: 1,
                maxArgs: 3
              },
              sendNativeMessage: {
                minArgs: 2,
                maxArgs: 2
              },
              setUninstallURL: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            sessions: {
              getDevices: {
                minArgs: 0,
                maxArgs: 1
              },
              getRecentlyClosed: {
                minArgs: 0,
                maxArgs: 1
              },
              restore: {
                minArgs: 0,
                maxArgs: 1
              }
            },
            storage: {
              local: {
                clear: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              managed: {
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                }
              },
              sync: {
                clear: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              }
            },
            tabs: {
              captureVisibleTab: {
                minArgs: 0,
                maxArgs: 2
              },
              create: {
                minArgs: 1,
                maxArgs: 1
              },
              detectLanguage: {
                minArgs: 0,
                maxArgs: 1
              },
              discard: {
                minArgs: 0,
                maxArgs: 1
              },
              duplicate: {
                minArgs: 1,
                maxArgs: 1
              },
              executeScript: {
                minArgs: 1,
                maxArgs: 2
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getCurrent: {
                minArgs: 0,
                maxArgs: 0
              },
              getZoom: {
                minArgs: 0,
                maxArgs: 1
              },
              getZoomSettings: {
                minArgs: 0,
                maxArgs: 1
              },
              goBack: {
                minArgs: 0,
                maxArgs: 1
              },
              goForward: {
                minArgs: 0,
                maxArgs: 1
              },
              highlight: {
                minArgs: 1,
                maxArgs: 1
              },
              insertCSS: {
                minArgs: 1,
                maxArgs: 2
              },
              move: {
                minArgs: 2,
                maxArgs: 2
              },
              query: {
                minArgs: 1,
                maxArgs: 1
              },
              reload: {
                minArgs: 0,
                maxArgs: 2
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeCSS: {
                minArgs: 1,
                maxArgs: 2
              },
              sendMessage: {
                minArgs: 2,
                maxArgs: 3
              },
              setZoom: {
                minArgs: 1,
                maxArgs: 2
              },
              setZoomSettings: {
                minArgs: 1,
                maxArgs: 2
              },
              update: {
                minArgs: 1,
                maxArgs: 2
              }
            },
            topSites: {
              get: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            webNavigation: {
              getAllFrames: {
                minArgs: 1,
                maxArgs: 1
              },
              getFrame: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            webRequest: {
              handlerBehaviorChanged: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            windows: {
              create: {
                minArgs: 0,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 2
              },
              getAll: {
                minArgs: 0,
                maxArgs: 1
              },
              getCurrent: {
                minArgs: 0,
                maxArgs: 1
              },
              getLastFocused: {
                minArgs: 0,
                maxArgs: 1
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            }
          };
          if (Object.keys(o).length === 0)
            throw new Error("api-metadata.json has not been included in browser-polyfill");
          class i extends WeakMap {
            constructor(C, T = void 0) {
              super(T), this.createItem = C;
            }
            get(C) {
              return this.has(C) || this.set(C, this.createItem(C)), super.get(C);
            }
          }
          const u = (E) => E && typeof E == "object" && typeof E.then == "function", l = (E, C) => (...T) => {
            n.runtime.lastError ? E.reject(new Error(n.runtime.lastError.message)) : C.singleCallbackArg || T.length <= 1 && C.singleCallbackArg !== !1 ? E.resolve(T[0]) : E.resolve(T);
          }, h = (E) => E == 1 ? "argument" : "arguments", f = (E, C) => function (k, ...P) {
            if (P.length < C.minArgs)
              throw new Error(`Expected at least ${C.minArgs} ${h(C.minArgs)} for ${E}(), got ${P.length}`);
            if (P.length > C.maxArgs)
              throw new Error(`Expected at most ${C.maxArgs} ${h(C.maxArgs)} for ${E}(), got ${P.length}`);
            return new Promise((R, F) => {
              if (C.fallbackToNoCallback)
                try {
                  k[E](...P, l({
                    resolve: R,
                    reject: F
                  }, C));
                } catch (N) {
                  console.warn(`${E} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, N), k[E](...P), C.fallbackToNoCallback = !1, C.noCallback = !0, R();
                }
              else C.noCallback ? (k[E](...P), R()) : k[E](...P, l({
                resolve: R,
                reject: F
              }, C));
            });
          }, p = (E, C, T) => new Proxy(C, {
            apply(k, P, R) {
              return T.call(P, E, ...R);
            }
          });
          let d = Function.call.bind(Object.prototype.hasOwnProperty);
          const g = (E, C = {}, T = {}) => {
            let k = /* @__PURE__ */ Object.create(null), P = {
              has(F, N) {
                return N in E || N in k;
              },
              get(F, N, j) {
                if (N in k)
                  return k[N];
                if (!(N in E))
                  return;
                let V = E[N];
                if (typeof V == "function")
                  if (typeof C[N] == "function")
                    V = p(E, E[N], C[N]);
                  else if (d(T, N)) {
                    let X = f(N, T[N]);
                    V = p(E, E[N], X);
                  } else
                    V = V.bind(E);
                else if (typeof V == "object" && V !== null && (d(C, N) || d(T, N)))
                  V = g(V, C[N], T[N]);
                else if (d(T, "*"))
                  V = g(V, C[N], T["*"]);
                else
                  return Object.defineProperty(k, N, {
                    configurable: !0,
                    enumerable: !0,
                    get() {
                      return E[N];
                    },
                    set(X) {
                      E[N] = X;
                    }
                  }), V;
                return k[N] = V, V;
              },
              set(F, N, j, V) {
                return N in k ? k[N] = j : E[N] = j, !0;
              },
              defineProperty(F, N, j) {
                return Reflect.defineProperty(k, N, j);
              },
              deleteProperty(F, N) {
                return Reflect.deleteProperty(k, N);
              }
            }, R = Object.create(E);
            return new Proxy(R, P);
          }, v = (E) => ({
            addListener(C, T, ...k) {
              C.addListener(E.get(T), ...k);
            },
            hasListener(C, T) {
              return C.hasListener(E.get(T));
            },
            removeListener(C, T) {
              C.removeListener(E.get(T));
            }
          }), y = new i((E) => typeof E != "function" ? E : function (T) {
            const k = g(T, {}, {
              getContent: {
                minArgs: 0,
                maxArgs: 0
              }
            });
            E(k);
          }), _ = new i((E) => typeof E != "function" ? E : function (T, k, P) {
            let R = !1, F, N = new Promise((J) => {
              F = function (Y) {
                R = !0, J(Y);
              };
            }), j;
            try {
              j = E(T, k, F);
            } catch (J) {
              j = Promise.reject(J);
            }
            const V = j !== !0 && u(j);
            if (j !== !0 && !V && !R)
              return !1;
            const X = (J) => {
              J.then((Y) => {
                P(Y);
              }, (Y) => {
                let te;
                Y && (Y instanceof Error || typeof Y.message == "string") ? te = Y.message : te = "An unexpected error occurred", P({
                  __mozWebExtensionPolyfillReject__: !0,
                  message: te
                });
              }).catch((Y) => {
                console.error("Failed to send onMessage rejected reply", Y);
              });
            };
            return X(V ? j : N), !0;
          }), D = ({
            reject: E,
            resolve: C
          }, T) => {
            n.runtime.lastError ? n.runtime.lastError.message === a ? C() : E(new Error(n.runtime.lastError.message)) : T && T.__mozWebExtensionPolyfillReject__ ? E(new Error(T.message)) : C(T);
          }, O = (E, C, T, ...k) => {
            if (k.length < C.minArgs)
              throw new Error(`Expected at least ${C.minArgs} ${h(C.minArgs)} for ${E}(), got ${k.length}`);
            if (k.length > C.maxArgs)
              throw new Error(`Expected at most ${C.maxArgs} ${h(C.maxArgs)} for ${E}(), got ${k.length}`);
            return new Promise((P, R) => {
              const F = D.bind(null, {
                resolve: P,
                reject: R
              });
              k.push(F), T.sendMessage(...k);
            });
          }, S = {
            devtools: {
              network: {
                onRequestFinished: v(y)
              }
            },
            runtime: {
              onMessage: v(_),
              onMessageExternal: v(_),
              sendMessage: O.bind(null, "sendMessage", {
                minArgs: 1,
                maxArgs: 3
              })
            },
            tabs: {
              sendMessage: O.bind(null, "sendMessage", {
                minArgs: 2,
                maxArgs: 3
              })
            }
          }, x = {
            clear: {
              minArgs: 1,
              maxArgs: 1
            },
            get: {
              minArgs: 1,
              maxArgs: 1
            },
            set: {
              minArgs: 1,
              maxArgs: 1
            }
          };
          return o.privacy = {
            network: {
              "*": x
            },
            services: {
              "*": x
            },
            websites: {
              "*": x
            }
          }, g(n, S, o);
        };
        r.exports = t(chrome);
      }
    });
  }(na)), na.exports;
}
pc();
var Dr;
(function (s) {
  s.Local = "local", s.Sync = "sync", s.Managed = "managed", s.Session = "session";
})(Dr || (Dr = {}));
var Ts;
(function (s) {
  s.ExtensionPagesOnly = "TRUSTED_CONTEXTS", s.ExtensionPagesAndContentScripts = "TRUSTED_AND_UNTRUSTED_CONTEXTS";
})(Ts || (Ts = {}));
const et = globalThis.chrome, jn = async (s, e) => {
  const r = (t) => typeof t == "function", a = (t) => t instanceof Promise;
  return r(s) ? (a(s), s(e)) : s;
};
let Ln = !1;
function Un(s) {
  if (et && et.storage[s] === void 0)
    throw new Error(`Check your storage permission in manifest.json: ${s} is not defined`);
}
function mc(s, e, r) {
  var v, y;
  let a = null, t = !1, n = [];
  const o = (r == null ? void 0 : r.storageEnum) ?? Dr.Local, i = ((v = r == null ? void 0 : r.serialization) == null ? void 0 : v.serialize) ?? ((_) => _), u = ((y = r == null ? void 0 : r.serialization) == null ? void 0 : y.deserialize) ?? ((_) => _);
  Ln === !1 && o === Dr.Session && (r == null ? void 0 : r.sessionAccessForContentScripts) === !0 && (Un(o), et == null || et.storage[o].setAccessLevel({
    accessLevel: Ts.ExtensionPagesAndContentScripts
  }).catch((_) => {
    console.warn(_), console.warn("Please call setAccessLevel into different context, like a background script.");
  }), Ln = !0);
  const l = async () => {
    Un(o);
    const _ = await (et == null ? void 0 : et.storage[o].get([s]));
    return _ ? u(_[s]) ?? e : e;
  }, h = () => {
    n.forEach((_) => _());
  }, f = async (_) => {
    t || (a = await l()), a = await jn(_, a), await (et == null ? void 0 : et.storage[o].set({ [s]: i(a) })), h();
  }, p = (_) => (n = [...n, _], () => {
    n = n.filter((D) => D !== _);
  }), d = () => a;
  l().then((_) => {
    a = _, t = !0, h();
  });
  async function g(_) {
    if (_[s] === void 0)
      return;
    const D = u(_[s].newValue);
    a !== D && (a = await jn(D, a), h());
  }
  return et == null || et.storage[o].onChanged.addListener(g), {
    get: l,
    set: f,
    getSnapshot: d,
    subscribe: p
  };
}
const qn = mc("theme-storage-key", "light", {
  storageEnum: Dr.Local
}), gc = {
  ...qn,
  toggle: async () => {
    await qn.set((s) => s === "light" ? "dark" : "light");
  }
};
var $t = /* @__PURE__ */ ((s) => (s[s.DEBUG = 0] = "DEBUG", s[s.INFO = 1] = "INFO", s[s.WARN = 2] = "WARN", s[s.ERROR = 3] = "ERROR", s[s.NONE = 4] = "NONE", s))($t || {});
const vc = "mcp_logger_config";
class yc {
  constructor(e = vc) {
    B(this, "storageKey");
    this.storageKey = e;
  }
  /**
   * Get the global log level from storage
   */
  async getLevel() {
    try {
      if (typeof chrome > "u" || !chrome.storage)
        return null;
      const r = (await chrome.storage.local.get(this.storageKey))[this.storageKey];
      return r && typeof r.level == "number" ? r.level : null;
    } catch (e) {
      return console.error("[LoggerStorage] Failed to get level:", e), null;
    }
  }
  /**
   * Set the global log level in storage
   */
  async setLevel(e) {
    try {
      if (typeof chrome > "u" || !chrome.storage)
        return;
      const a = (await chrome.storage.local.get(this.storageKey))[this.storageKey] || {};
      a.level = e, await chrome.storage.local.set({ [this.storageKey]: a });
    } catch (r) {
      console.error("[LoggerStorage] Failed to set level:", r);
    }
  }
  /**
   * Get component-specific log levels from storage
   */
  async getComponentLevels() {
    try {
      if (typeof chrome > "u" || !chrome.storage)
        return {};
      const r = (await chrome.storage.local.get(this.storageKey))[this.storageKey];
      return r && r.componentLevels ? r.componentLevels : {};
    } catch (e) {
      return console.error("[LoggerStorage] Failed to get component levels:", e), {};
    }
  }
  /**
   * Set a component-specific log level in storage
   */
  async setComponentLevel(e, r) {
    try {
      if (typeof chrome > "u" || !chrome.storage)
        return;
      const t = (await chrome.storage.local.get(this.storageKey))[this.storageKey] || {};
      t.componentLevels || (t.componentLevels = {}), t.componentLevels[e] = r, await chrome.storage.local.set({ [this.storageKey]: t });
    } catch (a) {
      console.error("[LoggerStorage] Failed to set component level:", a);
    }
  }
  /**
   * Clear all logger configuration from storage
   */
  async clear() {
    try {
      if (typeof chrome > "u" || !chrome.storage)
        return;
      await chrome.storage.local.remove(this.storageKey);
    } catch (e) {
      console.error("[LoggerStorage] Failed to clear storage:", e);
    }
  }
}
const _c = { BASE_URL: "/", CEB_GA_API_SECRET: "I0PHa_CWTbuTlXSb3T-kXg", CEB_GA_MEASUREMENT_ID: "G-6ENY3Y3H9X", DEV: !0, MODE: "production", PROD: !1, SSR: !1, VITE_USER_NODE_ENV: "development" };
function zn(s) {
  return typeof s == "number" ? s : $t[s];
}
class on {
  constructor(e = "", r) {
    B(this, "level");
    B(this, "componentLevels");
    B(this, "namespace");
    B(this, "storage");
    B(this, "defaultLevel");
    B(this, "isInitialized", !1);
    this.namespace = e, this.componentLevels = /* @__PURE__ */ new Map();
    const a = this.isProductionEnvironment();
    this.defaultLevel = a ? $t.ERROR : $t.DEBUG, this.level = $t.ERROR, r != null && r.componentLevels && Object.entries(r.componentLevels).forEach(([t, n]) => {
      this.componentLevels.set(t, n);
    }), this.storage = (r == null ? void 0 : r.persist) !== !1 ? new yc(r == null ? void 0 : r.storageKey) : null, this.storage && this.initializeFromStorage();
  }
  /**
   * Detect if running in production environment
   */
  isProductionEnvironment() {
    try {
      if (typeof import.meta < "u" && _c)
        return !1;
    } catch {
    }
    if (typeof chrome < "u" && chrome.runtime)
      try {
        return !chrome.runtime.getURL("").includes("dev");
      } catch {
      }
    return !0;
  }
  /**
   * Initialize logger settings from Chrome Storage
   */
  async initializeFromStorage() {
    if (this.storage)
      try {
        const e = await this.storage.getLevel();
        e !== null && (this.level = e);
        const r = await this.storage.getComponentLevels();
        Object.entries(r).forEach(([a, t]) => {
          this.componentLevels.set(a, t);
        }), this.isInitialized = !0;
      } catch (e) {
        console.error("[Logger] Failed to initialize from storage:", e);
      }
  }
  /**
   * Get the effective log level for this logger instance
   */
  getEffectiveLevel() {
    return this.namespace && this.componentLevels.has(this.namespace) ? this.componentLevels.get(this.namespace) : this.level;
  }
  /**
   * Check if a message should be logged based on current level
   */
  shouldLog(e) {
    return e >= this.getEffectiveLevel();
  }
  /**
   * Format the log message with namespace prefix
   */
  formatMessage(...e) {
    return this.namespace ? [`[${this.namespace}]`, ...e] : e;
  }
  /**
   * Log a debug message
   */
  debug(...e) {
    this.shouldLog($t.DEBUG) && console.debug(...this.formatMessage(...e));
  }
  /**
   * Log an info message
   */
  info(...e) {
    this.shouldLog($t.INFO) && console.info(...this.formatMessage(...e));
  }
  /**
   * Log a warning message
   */
  warn(...e) {
    this.shouldLog($t.WARN) && console.warn(...this.formatMessage(...e));
  }
  /**
   * Log an error message
   */
  error(...e) {
    this.shouldLog($t.ERROR) && console.error(...this.formatMessage(...e));
  }
  /**
   * Set the global log level
   */
  setLevel(e) {
    this.level = zn(e), this.storage && this.storage.setLevel(this.level).catch((r) => {
      console.error("[Logger] Failed to persist level:", r);
    });
  }
  /**
   * Get the current global log level
   */
  getLevel() {
    return this.level;
  }
  /**
   * Set a component-specific log level
   */
  setComponentLevel(e, r) {
    const a = zn(r);
    this.componentLevels.set(e, a), this.storage && this.storage.setComponentLevel(e, a).catch((t) => {
      console.error("[Logger] Failed to persist component level:", t);
    });
  }
  /**
   * Get a component-specific log level
   */
  getComponentLevel(e) {
    return this.componentLevels.get(e);
  }
  /**
   * Reset all log levels to environment defaults
   */
  resetToDefaults() {
    this.level = this.defaultLevel, this.componentLevels.clear(), this.storage && this.storage.clear().catch((e) => {
      console.error("[Logger] Failed to clear storage:", e);
    });
  }
  /**
   * Create a child logger with a specific namespace
   */
  child(e) {
    return new on(e, {
      level: this.level,
      componentLevels: Object.fromEntries(this.componentLevels),
      persist: !1
      // Child loggers don't persist independently
    });
  }
  /**
   * Wait for storage initialization to complete
   */
  async waitForInitialization() {
    if (!this.storage) return;
    const e = 2e3, r = Date.now();
    for (; !this.isInitialized && Date.now() - r < e;)
      await new Promise((a) => setTimeout(a, 50));
  }
}
let Ia = null;
function st(s, e) {
  return Ia || (Ia = new on("", e)), Ia.child(s);
}
const Re = st("FirebaseRemoteConfigAPI");
class bc {
  constructor() {
    B(this, "projectConfig");
    B(this, "cachedConfig", {});
    B(this, "lastFetchTime", 0);
    B(this, "minimumFetchInterval", 36e5);
    // 1 hour in production
    B(this, "fetchTimeout", 6e4);
    // 60 seconds
    // Default configuration values
    B(this, "defaultConfig", {
      notifications_enabled: "true",
      max_notifications_per_day: "3",
      notification_cooldown_hours: "4",
      features: JSON.stringify({
        sidebar_v2: { enabled: !1, rollout: 0, schema_version: 1 },
        ai_tools_enhanced: { enabled: !0, rollout: 100, schema_version: 1 },
        notification_system: { enabled: !0, rollout: 100, schema_version: 1 }
      }),
      config_version: "1.0.0",
      schema_version: "1",
      last_updated: (/* @__PURE__ */ new Date()).toISOString(),
      privacy_policy_version: "1.0.0",
      data_collection_consent_required: "true",
      active_notifications: JSON.stringify([]),
      update_notifications: JSON.stringify({
        enabled: !0,
        min_version_gap: "0.1.0",
        channels: ["in-app", "badge"],
        schema_version: 1
      })
    });
    {
      Re.debug("[FirebaseRemoteConfigAPI] Remote Config is DISABLED - using defaults only"), this.projectConfig = { projectId: "", apiKey: "", appId: "" }, this.minimumFetchInterval = 0;
      return;
    }
  }
  async initialize() {
    Re.debug("[FirebaseRemoteConfigAPI] Initializing Remote Config API...");
    {
      Re.debug("[FirebaseRemoteConfigAPI] Remote Config DISABLED - initializing with defaults only"), this.initializeWithDefaults(), Re.debug("[FirebaseRemoteConfigAPI] Remote Config API initialized with defaults only");
      return;
    }
  }
  async fetchAndActivate(e = !1) {
    return Re.debug("[FirebaseRemoteConfigAPI] Remote Config DISABLED - skipping fetch, using defaults only"), !1;
  }
  async fetchRemoteConfig() {
    try {
      const e = await this.getInstallationId(), r = `https://firebaseremoteconfig.googleapis.com/v1/projects/${this.projectConfig.projectId}/namespaces/firebase:fetch`, a = {
        appId: this.projectConfig.appId,
        appInstanceId: e,
        appInstanceIdToken: "",
        // Would need Firebase Installations API for this
        languageCode: "en-US",
        platformVersion: chrome.runtime.getManifest().version,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }, t = new AbortController(), n = setTimeout(() => t.abort(), this.fetchTimeout);
      Re.debug("[FirebaseRemoteConfigAPI] Making request to:", r), Re.debug("[FirebaseRemoteConfigAPI] Request body:", JSON.stringify(a, null, 2));
      const o = await fetch(r, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.projectConfig.apiKey
        },
        body: JSON.stringify(a),
        signal: t.signal
      });
      if (clearTimeout(n), Re.debug("[FirebaseRemoteConfigAPI] Response status:", o.status, o.statusText), Re.debug("[FirebaseRemoteConfigAPI] Content-Type:", o.headers.get("content-type")), !o.ok) {
        const u = await o.text();
        throw Re.error("[FirebaseRemoteConfigAPI] Error response body:", u), new Error(`HTTP ${o.status}: ${o.statusText} - ${u}`);
      }
      const i = await o.json();
      if (Re.debug("[FirebaseRemoteConfigAPI] Raw Firebase response:", JSON.stringify(i, null, 2)), i.entries) {
        const u = {};
        Object.entries(i.entries).forEach(([h, f]) => {
          u[h] = {
            value: f,
            source: "remote"
          };
        });
        const l = {};
        for (const [h, f] of Object.entries(this.defaultConfig))
          l[h] = {
            value: f,
            source: "default"
          };
        Object.assign(l, u), this.cachedConfig = l, Re.debug(`Updated config with ${Object.keys(i.entries).length} remote values, removed deleted keys`), Re.debug("[FirebaseRemoteConfigAPI] Fetched configuration details:"), Object.entries(u).forEach(([h, f]) => {
          const p = f.value, d = f.source;
          let g = p;
          try {
            if (p && typeof p == "string") {
              const v = JSON.parse(p);
              g = JSON.stringify(v, null, 2);
            }
          } catch {
          }
          Re.debug(`  ${h} (${d}):`, g);
        });
      } else
        Re.warn("[FirebaseRemoteConfigAPI] No entries found in response:", i);
      return !0;
    } catch (e) {
      return e instanceof Error && e.name === "AbortError" ? Re.error("[FirebaseRemoteConfigAPI] Fetch timeout") : Re.error("[FirebaseRemoteConfigAPI] Fetch failed:", e), !1;
    }
  }
  getValue(e) {
    return this.cachedConfig[e] ? this.cachedConfig[e] : this.defaultConfig[e] ? {
      value: this.defaultConfig[e],
      source: "default"
    } : {
      value: "",
      source: "static"
    };
  }
  getAll() {
    const e = {};
    for (const [r, a] of Object.entries(this.defaultConfig))
      e[r] = {
        value: a,
        source: "default"
      };
    for (const [r, a] of Object.entries(this.cachedConfig))
      e[r] = a;
    return e;
  }
  initializeWithDefaults() {
    for (const [e, r] of Object.entries(this.defaultConfig))
      this.cachedConfig[e] || (this.cachedConfig[e] = {
        value: r,
        source: "default"
      });
  }
  async loadCachedConfig() {
    try {
      const e = await chrome.storage.local.get(["firebaseRemoteConfig", "firebaseRemoteConfigLastFetch"]);
      e.firebaseRemoteConfig && (this.cachedConfig = e.firebaseRemoteConfig), e.firebaseRemoteConfigLastFetch && (this.lastFetchTime = e.firebaseRemoteConfigLastFetch);
    } catch (e) {
      Re.error("[FirebaseRemoteConfigAPI] Failed to load cached config:", e);
    }
  }
  async saveCachedConfig() {
    try {
      await chrome.storage.local.set({
        firebaseRemoteConfig: this.cachedConfig,
        firebaseRemoteConfigLastFetch: this.lastFetchTime
      });
    } catch (e) {
      Re.error("[FirebaseRemoteConfigAPI] Failed to save cached config:", e);
    }
  }
  async getInstallationId() {
    try {
      const e = await chrome.storage.local.get(["firebaseInstallationId"]);
      if (e.firebaseInstallationId)
        return e.firebaseInstallationId;
      const r = this.generateInstallationId();
      return await chrome.storage.local.set({ firebaseInstallationId: r }), r;
    } catch (e) {
      return Re.error("[FirebaseRemoteConfigAPI] Failed to get installation ID:", e), this.generateInstallationId();
    }
  }
  generateInstallationId() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let r = "";
    for (let a = 0; a < 22; a++)
      r += e.charAt(Math.floor(Math.random() * e.length));
    return r;
  }
  /**
   * Clear cached config and force a fresh fetch
   * Useful when dealing with deleted Firebase keys
   */
  async clearCacheAndRefetch() {
    return Re.debug("[FirebaseRemoteConfigAPI] Remote Config DISABLED - skipping cache clear, using defaults only"), !1;
  }
}
const $a = (s) => {
  if (!s || typeof s != "object")
    return !1;
  try {
    return !(s.features && typeof s.features != "object" || s.notifications && !Array.isArray(s.notifications));
  } catch (e) {
    return Re.error("[FirebaseRemoteConfigAPI] Validation error:", e), !1;
  }
}, Qe = new bc(), ae = st("RemoteConfigManager");
class wc {
  constructor() {
    B(this, "isInitialized", !1);
    B(this, "fetchInterval", null);
    B(this, "lastFetchTime", null);
    B(this, "retryCount", 0);
    B(this, "maxRetries", 3);
  }
  async initialize() {
    try {
      ae.debug("[RemoteConfigManager] Initializing Remote Config Manager..."), await Qe.initialize(), await this.fetchConfig(!0), this.startPeriodicFetch(), this.isInitialized = !0, ae.debug("[RemoteConfigManager] Remote Config Manager initialized successfully");
    } catch (e) {
      throw ae.error("[RemoteConfigManager] Failed to initialize:", e), e;
    }
  }
  async fetchConfig(e = !1) {
    try {
      const r = Date.now();
      if (!e && this.lastFetchTime && r - this.lastFetchTime < 36e5) {
        ae.debug("[RemoteConfigManager] Skipping fetch due to minimum interval");
        return;
      }
      ae.debug("[RemoteConfigManager] Fetching remote config..."), await Qe.fetchAndActivate(e), await this.processConfiguration(), this.lastFetchTime = r, await this.setLastFetchTime(r), this.retryCount = 0, ae.debug("[RemoteConfigManager] Remote config fetched successfully");
      const t = Qe.getAll(), n = Object.values(t).filter((i) => i.source === "remote").length, o = Object.values(t).filter((i) => i.source === "default").length;
      ae.debug(`Config summary: ${n} remote values, ${o} default values`);
    } catch (r) {
      this.retryCount++;
      const a = r instanceof Error ? r.message : String(r);
      if (ae.error("[RemoteConfigManager] Failed to fetch config:", a), this.retryCount <= this.maxRetries) {
        const t = Math.pow(2, this.retryCount) * 1e3;
        setTimeout(() => this.fetchConfig(e), t);
      }
      throw r;
    }
  }
  async processConfiguration() {
    try {
      const e = Qe.getAll();
      ae.debug("[RemoteConfigManager] Processing configuration. Available configs:"), Object.entries(e).forEach(([r, a]) => {
        const t = a.value, n = a.source;
        let o = t;
        try {
          const i = JSON.parse(t);
          o = JSON.stringify(i, null, 2);
        } catch {
        }
        ae.debug(`  ${r} (${n}):`, o);
      }), await this.processFeatureFlags(e), await this.processNotifications(e), await this.processAdapterConfigurations(e), await this.processVersionConfigurations(e);
    } catch (e) {
      throw ae.error("[RemoteConfigManager] Failed to process configuration:", e), e;
    }
  }
  async processFeatureFlags(e) {
    try {
      const a = Qe.getValue("features").value;
      if (a) {
        const t = JSON.parse(a);
        $a({ features: t }) && (await this.broadcastFeatureFlags(t), ae.debug(`Updated ${Object.keys(t).length} feature flags`));
      }
    } catch (r) {
      ae.error("[RemoteConfigManager] Failed to process feature flags:", r);
    }
  }
  async processNotifications(e) {
    try {
      const a = Qe.getValue("active_notifications").value;
      if (a) {
        const t = JSON.parse(a);
        $a({ notifications: t }) && (await this.broadcastNotifications(t), ae.debug(`Processed ${t.length} notifications`));
      }
    } catch (r) {
      ae.error("[RemoteConfigManager] Failed to process notifications:", r);
    }
  }
  async processAdapterConfigurations(e) {
    try {
      let r = {}, a = !1;
      const n = Qe.getValue("adapter_configs").value;
      if (n)
        try {
          const i = JSON.parse(n);
          r = { ...i }, a = !0, ae.debug(`Found unified adapter_configs with ${Object.keys(i).length} adapters`);
        } catch (i) {
          ae.warn("[RemoteConfigManager] Failed to parse unified adapter_configs:", i);
        }
      const o = Object.keys(e).filter((i) => i.endsWith("_adapter_config"));
      if (o.length > 0) {
        ae.debug(`Found ${o.length} individual adapter config parameters:`, o);
        for (const i of o)
          try {
            const u = Qe.getValue(i);
            if (u.value) {
              const l = JSON.parse(u.value), h = i.replace("_adapter_config", "");
              r[h] = l, a = !0, ae.debug(`Loaded individual config for adapter: ${h}`);
            }
          } catch (u) {
            ae.warn(`Failed to parse ${i}:`, u);
          }
      }
      a && Object.keys(r).length > 0 ? this.validateAdapterConfigs(r) ? (await this.broadcastAdapterConfigs(r), ae.debug(`Processed and broadcasted ${Object.keys(r).length} adapter configurations`)) : ae.warn("[RemoteConfigManager] Adapter configs validation failed") : ae.debug("[RemoteConfigManager] No adapter configurations found");
    } catch (r) {
      ae.error("[RemoteConfigManager] Failed to process adapter configurations:", r);
    }
  }
  validateAdapterConfigs(e) {
    if (!e || typeof e != "object")
      return ae.warn("[RemoteConfigManager] Invalid adapter configs structure"), !1;
    for (const [r, a] of Object.entries(e)) {
      if (!a || typeof a != "object") {
        ae.warn(`Invalid config for adapter: ${r}`);
        continue;
      }
      const t = a;
      if (!t.selectors || !t.ui) {
        ae.warn(`Missing required fields for adapter: ${r}`);
        continue;
      }
    }
    return !0;
  }
  async processVersionConfigurations(e) {
    try {
      const a = `version_config_${chrome.runtime.getManifest().version.replace(/\./g, "_")}`, n = Qe.getValue(a).value;
      if (n) {
        const o = JSON.parse(n);
        $a(o) && (await this.broadcastVersionConfig(o), ae.debug("[RemoteConfigManager] Applied version-specific configuration"));
      }
    } catch (r) {
      ae.error("[RemoteConfigManager] Failed to process version configurations:", r);
    }
  }
  async broadcastFeatureFlags(e) {
    try {
      const r = await chrome.tabs.query({ active: !0 });
      for (const a of r)
        if (a.id)
          try {
            await chrome.tabs.sendMessage(a.id, {
              type: "remote-config:feature-flags-updated",
              data: {
                flags: e,
                timestamp: Date.now()
              }
            });
          } catch {
            ae.debug("[RemoteConfigManager] Could not send message to tab:", a.id);
          }
    } catch (r) {
      ae.error("[RemoteConfigManager] Failed to broadcast feature flags:", r);
    }
  }
  async broadcastNotifications(e) {
    try {
      const r = await chrome.tabs.query({ active: !0 });
      for (const a of r)
        if (a.id)
          try {
            await chrome.tabs.sendMessage(a.id, {
              type: "remote-config:notifications-received",
              data: {
                notifications: e,
                timestamp: Date.now()
              }
            });
          } catch {
            ae.debug("[RemoteConfigManager] Could not send message to tab:", a.id);
          }
    } catch (r) {
      ae.error("[RemoteConfigManager] Failed to broadcast notifications:", r);
    }
  }
  async broadcastAdapterConfigs(e) {
    try {
      const r = await chrome.tabs.query({});
      let a = 0;
      for (const t of r)
        if (t.id && t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://"))
          try {
            await chrome.tabs.sendMessage(t.id, {
              type: "remote-config:adapter-configs-updated",
              data: {
                adapterConfigs: e,
                timestamp: Date.now()
              }
            }), a++;
          } catch (n) {
            ae.debug(`Could not send adapter config message to tab ${t.id}:`, n instanceof Error ? n.message : String(n));
          }
      ae.debug(`Broadcasted adapter configs to ${a} tabs`);
    } catch (r) {
      ae.error("[RemoteConfigManager] Failed to broadcast adapter configurations:", r);
    }
  }
  async broadcastVersionConfig(e) {
    try {
      const r = await chrome.tabs.query({ active: !0 });
      for (const a of r)
        if (a.id)
          try {
            await chrome.tabs.sendMessage(a.id, {
              type: "remote-config:version-config-updated",
              data: {
                config: e,
                timestamp: Date.now()
              }
            });
          } catch {
            ae.debug("[RemoteConfigManager] Could not send message to tab:", a.id);
          }
    } catch (r) {
      ae.error("[RemoteConfigManager] Failed to broadcast version config:", r);
    }
  }
  //development
  //   private startPeriodicFetch(): void {
  //     // Fetch every 5 sec
  //     this.fetchInterval = setInterval(() => {
  //       this.fetchConfig(true);
  //     }, 5000);
  //     logger.debug('[RemoteConfigManager] Started periodic config fetching');
  //   }
  startPeriodicFetch() {
    this.fetchInterval = setInterval(() => {
      this.fetchConfig(!1);
    }, 12 * 60 * 60 * 1e3), ae.debug("[RemoteConfigManager] Started periodic config fetching");
  }
  stopPeriodicFetch() {
    this.fetchInterval && (clearInterval(this.fetchInterval), this.fetchInterval = null, ae.debug("[RemoteConfigManager] Stopped periodic config fetching"));
  }
  async setLastFetchTime(e) {
    await chrome.storage.local.set({ remoteConfigLastFetch: e });
  }
  async getLastFetchTime() {
    const e = await chrome.storage.local.get(["remoteConfigLastFetch"]);
    return (e == null ? void 0 : e.remoteConfigLastFetch) || null;
  }
  async getFeatureFlag(e) {
    try {
      const a = Qe.getValue("features").value;
      return a && JSON.parse(a)[e] || null;
    } catch (r) {
      return ae.error("[RemoteConfigManager] Failed to get feature flag:", r), null;
    }
  }
  async getAllConfig() {
    try {
      return Qe.getAll();
    } catch (e) {
      return ae.error("[RemoteConfigManager] Failed to get all config:", e), {};
    }
  }
  async getSpecificConfig(e) {
    try {
      const r = Qe.getAll();
      if (e.includes("adapter_config")) {
        const t = Qe.getValue("adapter_configs").value;
        if (t) {
          const o = JSON.parse(t);
          if (e.endsWith("_adapter_config")) {
            const i = e.replace("_adapter_config", "");
            return { [e]: o[i] || null };
          }
        }
        const n = Qe.getValue(e);
        if (n.value)
          try {
            return { [e]: JSON.parse(n.value) };
          } catch {
            return { [e]: n.value };
          }
        return { [e]: null };
      }
      if (r[e]) {
        const a = r[e];
        try {
          return { [e]: JSON.parse(a.value) };
        } catch {
          return { [e]: a.value };
        }
      }
      return { [e]: null };
    } catch (r) {
      return ae.error(`Failed to get specific config for key ${e}:`, r), { [e]: null };
    }
  }
  async cleanup() {
    this.stopPeriodicFetch(), this.isInitialized = !1, this.lastFetchTime = null, this.retryCount = 0, ae.debug("[RemoteConfigManager] Cleaned up");
  }
  get initialized() {
    return this.isInitialized;
  }
  async getLastFetchTimePublic() {
    return this.getLastFetchTime();
  }
  /**
   * Clear cache and force refresh - useful for handling deleted Firebase keys
   */
  async clearCacheAndRefresh() {
    try {
      ae.debug("[RemoteConfigManager] Clearing cache and forcing refresh...");
      const e = await Qe.clearCacheAndRefetch();
      return e && (await this.processConfiguration(), ae.debug("[RemoteConfigManager] Cache cleared and config refreshed successfully")), e;
    } catch (e) {
      return ae.error("[RemoteConfigManager] Failed to clear cache and refresh:", e), !1;
    }
  }
}
var ge;
(function (s) {
  s.assertEqual = (t) => t;
  function e(t) {
  }
  s.assertIs = e;
  function r(t) {
    throw new Error();
  }
  s.assertNever = r, s.arrayToEnum = (t) => {
    const n = {};
    for (const o of t)
      n[o] = o;
    return n;
  }, s.getValidEnumValues = (t) => {
    const n = s.objectKeys(t).filter((i) => typeof t[t[i]] != "number"), o = {};
    for (const i of n)
      o[i] = t[i];
    return s.objectValues(o);
  }, s.objectValues = (t) => s.objectKeys(t).map(function (n) {
    return t[n];
  }), s.objectKeys = typeof Object.keys == "function" ? (t) => Object.keys(t) : (t) => {
    const n = [];
    for (const o in t)
      Object.prototype.hasOwnProperty.call(t, o) && n.push(o);
    return n;
  }, s.find = (t, n) => {
    for (const o of t)
      if (n(o))
        return o;
  }, s.isInteger = typeof Number.isInteger == "function" ? (t) => Number.isInteger(t) : (t) => typeof t == "number" && isFinite(t) && Math.floor(t) === t;
  function a(t, n = " | ") {
    return t.map((o) => typeof o == "string" ? `'${o}'` : o).join(n);
  }
  s.joinValues = a, s.jsonStringifyReplacer = (t, n) => typeof n == "bigint" ? n.toString() : n;
})(ge || (ge = {}));
var ks;
(function (s) {
  s.mergeShapes = (e, r) => ({
    ...e,
    ...r
    // second overwrites first
  });
})(ks || (ks = {}));
const W = ge.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]), Ot = (s) => {
  switch (typeof s) {
    case "undefined":
      return W.undefined;
    case "string":
      return W.string;
    case "number":
      return isNaN(s) ? W.nan : W.number;
    case "boolean":
      return W.boolean;
    case "function":
      return W.function;
    case "bigint":
      return W.bigint;
    case "symbol":
      return W.symbol;
    case "object":
      return Array.isArray(s) ? W.array : s === null ? W.null : s.then && typeof s.then == "function" && s.catch && typeof s.catch == "function" ? W.promise : typeof Map < "u" && s instanceof Map ? W.map : typeof Set < "u" && s instanceof Set ? W.set : typeof Date < "u" && s instanceof Date ? W.date : W.object;
    default:
      return W.unknown;
  }
}, q = ge.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]), Ec = (s) => JSON.stringify(s, null, 2).replace(/"([^"]+)":/g, "$1:");
class at extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (a) => {
      this.issues = [...this.issues, a];
    }, this.addIssues = (a = []) => {
      this.issues = [...this.issues, ...a];
    };
    const r = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, r) : this.__proto__ = r, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const r = e || function (n) {
      return n.message;
    }, a = { _errors: [] }, t = (n) => {
      for (const o of n.issues)
        if (o.code === "invalid_union")
          o.unionErrors.map(t);
        else if (o.code === "invalid_return_type")
          t(o.returnTypeError);
        else if (o.code === "invalid_arguments")
          t(o.argumentsError);
        else if (o.path.length === 0)
          a._errors.push(r(o));
        else {
          let i = a, u = 0;
          for (; u < o.path.length;) {
            const l = o.path[u];
            u === o.path.length - 1 ? (i[l] = i[l] || { _errors: [] }, i[l]._errors.push(r(o))) : i[l] = i[l] || { _errors: [] }, i = i[l], u++;
          }
        }
    };
    return t(this), a;
  }
  static assert(e) {
    if (!(e instanceof at))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, ge.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (r) => r.message) {
    const r = {}, a = [];
    for (const t of this.issues)
      t.path.length > 0 ? (r[t.path[0]] = r[t.path[0]] || [], r[t.path[0]].push(e(t))) : a.push(e(t));
    return { formErrors: a, fieldErrors: r };
  }
  get formErrors() {
    return this.flatten();
  }
}
at.create = (s) => new at(s);
const vr = (s, e) => {
  let r;
  switch (s.code) {
    case q.invalid_type:
      s.received === W.undefined ? r = "Required" : r = `Expected ${s.expected}, received ${s.received}`;
      break;
    case q.invalid_literal:
      r = `Invalid literal value, expected ${JSON.stringify(s.expected, ge.jsonStringifyReplacer)}`;
      break;
    case q.unrecognized_keys:
      r = `Unrecognized key(s) in object: ${ge.joinValues(s.keys, ", ")}`;
      break;
    case q.invalid_union:
      r = "Invalid input";
      break;
    case q.invalid_union_discriminator:
      r = `Invalid discriminator value. Expected ${ge.joinValues(s.options)}`;
      break;
    case q.invalid_enum_value:
      r = `Invalid enum value. Expected ${ge.joinValues(s.options)}, received '${s.received}'`;
      break;
    case q.invalid_arguments:
      r = "Invalid function arguments";
      break;
    case q.invalid_return_type:
      r = "Invalid function return type";
      break;
    case q.invalid_date:
      r = "Invalid date";
      break;
    case q.invalid_string:
      typeof s.validation == "object" ? "includes" in s.validation ? (r = `Invalid input: must include "${s.validation.includes}"`, typeof s.validation.position == "number" && (r = `${r} at one or more positions greater than or equal to ${s.validation.position}`)) : "startsWith" in s.validation ? r = `Invalid input: must start with "${s.validation.startsWith}"` : "endsWith" in s.validation ? r = `Invalid input: must end with "${s.validation.endsWith}"` : ge.assertNever(s.validation) : s.validation !== "regex" ? r = `Invalid ${s.validation}` : r = "Invalid";
      break;
    case q.too_small:
      s.type === "array" ? r = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "more than"} ${s.minimum} element(s)` : s.type === "string" ? r = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at least" : "over"} ${s.minimum} character(s)` : s.type === "number" ? r = `Number must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${s.minimum}` : s.type === "date" ? r = `Date must be ${s.exact ? "exactly equal to " : s.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(s.minimum))}` : r = "Invalid input";
      break;
    case q.too_big:
      s.type === "array" ? r = `Array must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "less than"} ${s.maximum} element(s)` : s.type === "string" ? r = `String must contain ${s.exact ? "exactly" : s.inclusive ? "at most" : "under"} ${s.maximum} character(s)` : s.type === "number" ? r = `Number must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "bigint" ? r = `BigInt must be ${s.exact ? "exactly" : s.inclusive ? "less than or equal to" : "less than"} ${s.maximum}` : s.type === "date" ? r = `Date must be ${s.exact ? "exactly" : s.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(s.maximum))}` : r = "Invalid input";
      break;
    case q.custom:
      r = "Invalid input";
      break;
    case q.invalid_intersection_types:
      r = "Intersection results could not be merged";
      break;
    case q.not_multiple_of:
      r = `Number must be a multiple of ${s.multipleOf}`;
      break;
    case q.not_finite:
      r = "Number must be finite";
      break;
    default:
      r = e.defaultError, ge.assertNever(s);
  }
  return { message: r };
};
let Yi = vr;
function Sc(s) {
  Yi = s;
}
function la() {
  return Yi;
}
const ua = (s) => {
  const { data: e, path: r, errorMaps: a, issueData: t } = s, n = [...r, ...t.path || []], o = {
    ...t,
    path: n
  };
  if (t.message !== void 0)
    return {
      ...t,
      path: n,
      message: t.message
    };
  let i = "";
  const u = a.filter((l) => !!l).slice().reverse();
  for (const l of u)
    i = l(o, { data: e, defaultError: i }).message;
  return {
    ...t,
    path: n,
    message: i
  };
}, Pc = [];
function H(s, e) {
  const r = la(), a = ua({
    issueData: e,
    data: s.data,
    path: s.path,
    errorMaps: [
      s.common.contextualErrorMap,
      // contextual error map is first priority
      s.schemaErrorMap,
      // then schema-bound map if available
      r,
      // then global override map
      r === vr ? void 0 : vr
      // then global default map
    ].filter((t) => !!t)
  });
  s.common.issues.push(a);
}
class Be {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, r) {
    const a = [];
    for (const t of r) {
      if (t.status === "aborted")
        return re;
      t.status === "dirty" && e.dirty(), a.push(t.value);
    }
    return { status: e.value, value: a };
  }
  static async mergeObjectAsync(e, r) {
    const a = [];
    for (const t of r) {
      const n = await t.key, o = await t.value;
      a.push({
        key: n,
        value: o
      });
    }
    return Be.mergeObjectSync(e, a);
  }
  static mergeObjectSync(e, r) {
    const a = {};
    for (const t of r) {
      const { key: n, value: o } = t;
      if (n.status === "aborted" || o.status === "aborted")
        return re;
      n.status === "dirty" && e.dirty(), o.status === "dirty" && e.dirty(), n.value !== "__proto__" && (typeof o.value < "u" || t.alwaysSet) && (a[n.value] = o.value);
    }
    return { status: e.value, value: a };
  }
}
const re = Object.freeze({
  status: "aborted"
}), lr = (s) => ({ status: "dirty", value: s }), Ye = (s) => ({ status: "valid", value: s }), Is = (s) => s.status === "aborted", $s = (s) => s.status === "dirty", er = (s) => s.status === "valid", Fr = (s) => typeof Promise < "u" && s instanceof Promise;
function da(s, e, r, a) {
  if (typeof e == "function" ? s !== e || !0 : !e.has(s)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return e.get(s);
}
function Xi(s, e, r, a, t) {
  if (typeof e == "function" ? s !== e || !0 : !e.has(s)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return e.set(s, r), r;
}
var Q;
(function (s) {
  s.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, s.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(Q || (Q = {}));
var xr, Ar;
class Pt {
  constructor(e, r, a, t) {
    this._cachedPath = [], this.parent = e, this.data = r, this._path = a, this._key = t;
  }
  get path() {
    return this._cachedPath.length || (this._key instanceof Array ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Vn = (s, e) => {
  if (er(e))
    return { success: !0, data: e.value };
  if (!s.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const r = new at(s.common.issues);
      return this._error = r, this._error;
    }
  };
};
function ce(s) {
  if (!s)
    return {};
  const { errorMap: e, invalid_type_error: r, required_error: a, description: t } = s;
  if (e && (r || a))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: t } : {
    errorMap: (o, i) => {
      var u, l;
      const { message: h } = s;
      return o.code === "invalid_enum_value" ? { message: h ?? i.defaultError } : typeof i.data > "u" ? { message: (u = h ?? a) !== null && u !== void 0 ? u : i.defaultError } : o.code !== "invalid_type" ? { message: i.defaultError } : { message: (l = h ?? r) !== null && l !== void 0 ? l : i.defaultError };
    }, description: t
  };
}
class ue {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return Ot(e.data);
  }
  _getOrReturnCtx(e, r) {
    return r || {
      common: e.parent.common,
      data: e.data,
      parsedType: Ot(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new Be(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: Ot(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const r = this._parse(e);
    if (Fr(r))
      throw new Error("Synchronous parse encountered promise.");
    return r;
  }
  _parseAsync(e) {
    const r = this._parse(e);
    return Promise.resolve(r);
  }
  parse(e, r) {
    const a = this.safeParse(e, r);
    if (a.success)
      return a.data;
    throw a.error;
  }
  safeParse(e, r) {
    var a;
    const t = {
      common: {
        issues: [],
        async: (a = r == null ? void 0 : r.async) !== null && a !== void 0 ? a : !1,
        contextualErrorMap: r == null ? void 0 : r.errorMap
      },
      path: (r == null ? void 0 : r.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: Ot(e)
    }, n = this._parseSync({ data: e, path: t.path, parent: t });
    return Vn(t, n);
  }
  "~validate"(e) {
    var r, a;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: Ot(e)
    };
    if (!this["~standard"].async)
      try {
        const n = this._parseSync({ data: e, path: [], parent: t });
        return er(n) ? {
          value: n.value
        } : {
          issues: t.common.issues
        };
      } catch (n) {
        !((a = (r = n == null ? void 0 : n.message) === null || r === void 0 ? void 0 : r.toLowerCase()) === null || a === void 0) && a.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((n) => er(n) ? {
      value: n.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, r) {
    const a = await this.safeParseAsync(e, r);
    if (a.success)
      return a.data;
    throw a.error;
  }
  async safeParseAsync(e, r) {
    const a = {
      common: {
        issues: [],
        contextualErrorMap: r == null ? void 0 : r.errorMap,
        async: !0
      },
      path: (r == null ? void 0 : r.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: Ot(e)
    }, t = this._parse({ data: e, path: a.path, parent: a }), n = await (Fr(t) ? t : Promise.resolve(t));
    return Vn(a, n);
  }
  refine(e, r) {
    const a = (t) => typeof r == "string" || typeof r > "u" ? { message: r } : typeof r == "function" ? r(t) : r;
    return this._refinement((t, n) => {
      const o = e(t), i = () => n.addIssue({
        code: q.custom,
        ...a(t)
      });
      return typeof Promise < "u" && o instanceof Promise ? o.then((u) => u ? !0 : (i(), !1)) : o ? !0 : (i(), !1);
    });
  }
  refinement(e, r) {
    return this._refinement((a, t) => e(a) ? !0 : (t.addIssue(typeof r == "function" ? r(a, t) : r), !1));
  }
  _refinement(e) {
    return new gt({
      schema: this,
      typeName: ee.ZodEffects,
      effect: { type: "refinement", refinement: e }
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  constructor(e) {
    this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (r) => this["~validate"](r)
    };
  }
  optional() {
    return St.create(this, this._def);
  }
  nullable() {
    return Vt.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return mt.create(this);
  }
  promise() {
    return _r.create(this, this._def);
  }
  or(e) {
    return Lr.create([this, e], this._def);
  }
  and(e) {
    return Ur.create(this, e, this._def);
  }
  transform(e) {
    return new gt({
      ...ce(this._def),
      schema: this,
      typeName: ee.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const r = typeof e == "function" ? e : () => e;
    return new Br({
      ...ce(this._def),
      innerType: this,
      defaultValue: r,
      typeName: ee.ZodDefault
    });
  }
  brand() {
    return new cn({
      typeName: ee.ZodBranded,
      type: this,
      ...ce(this._def)
    });
  }
  catch(e) {
    const r = typeof e == "function" ? e : () => e;
    return new Zr({
      ...ce(this._def),
      innerType: this,
      catchValue: r,
      typeName: ee.ZodCatch
    });
  }
  describe(e) {
    const r = this.constructor;
    return new r({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return Gr.create(this, e);
  }
  readonly() {
    return Wr.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const Cc = /^c[^\s-]{8,}$/i, xc = /^[0-9a-z]+$/, Ac = /^[0-9A-HJKMNP-TV-Z]{26}$/i, Rc = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, Tc = /^[a-z0-9_-]{21}$/i, kc = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, Ic = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, $c = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, Oc = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let Oa;
const Dc = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Fc = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, Nc = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, Mc = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, jc = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, Lc = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, eo = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Uc = new RegExp(`^${eo}$`);
function to(s) {
  let e = "([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d";
  return s.precision ? e = `${e}\\.\\d{${s.precision}}` : s.precision == null && (e = `${e}(\\.\\d+)?`), e;
}
function qc(s) {
  return new RegExp(`^${to(s)}$`);
}
function ro(s) {
  let e = `${eo}T${to(s)}`;
  const r = [];
  return r.push(s.local ? "Z?" : "Z"), s.offset && r.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${r.join("|")})`, new RegExp(`^${e}$`);
}
function zc(s, e) {
  return !!((e === "v4" || !e) && Dc.test(s) || (e === "v6" || !e) && Nc.test(s));
}
function Vc(s, e) {
  if (!kc.test(s))
    return !1;
  try {
    const [r] = s.split("."), a = r.replace(/-/g, "+").replace(/_/g, "/").padEnd(r.length + (4 - r.length % 4) % 4, "="), t = JSON.parse(atob(a));
    return !(typeof t != "object" || t === null || !t.typ || !t.alg || e && t.alg !== e);
  } catch {
    return !1;
  }
}
function Hc(s, e) {
  return !!((e === "v4" || !e) && Fc.test(s) || (e === "v6" || !e) && Mc.test(s));
}
class pt extends ue {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== W.string) {
      const n = this._getOrReturnCtx(e);
      return H(n, {
        code: q.invalid_type,
        expected: W.string,
        received: n.parsedType
      }), re;
    }
    const a = new Be();
    let t;
    for (const n of this._def.checks)
      if (n.kind === "min")
        e.data.length < n.value && (t = this._getOrReturnCtx(e, t), H(t, {
          code: q.too_small,
          minimum: n.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: n.message
        }), a.dirty());
      else if (n.kind === "max")
        e.data.length > n.value && (t = this._getOrReturnCtx(e, t), H(t, {
          code: q.too_big,
          maximum: n.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: n.message
        }), a.dirty());
      else if (n.kind === "length") {
        const o = e.data.length > n.value, i = e.data.length < n.value;
        (o || i) && (t = this._getOrReturnCtx(e, t), o ? H(t, {
          code: q.too_big,
          maximum: n.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: n.message
        }) : i && H(t, {
          code: q.too_small,
          minimum: n.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: n.message
        }), a.dirty());
      } else if (n.kind === "email")
        $c.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
          validation: "email",
          code: q.invalid_string,
          message: n.message
        }), a.dirty());
      else if (n.kind === "emoji")
        Oa || (Oa = new RegExp(Oc, "u")), Oa.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
          validation: "emoji",
          code: q.invalid_string,
          message: n.message
        }), a.dirty());
      else if (n.kind === "uuid")
        Rc.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
          validation: "uuid",
          code: q.invalid_string,
          message: n.message
        }), a.dirty());
      else if (n.kind === "nanoid")
        Tc.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
          validation: "nanoid",
          code: q.invalid_string,
          message: n.message
        }), a.dirty());
      else if (n.kind === "cuid")
        Cc.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
          validation: "cuid",
          code: q.invalid_string,
          message: n.message
        }), a.dirty());
      else if (n.kind === "cuid2")
        xc.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
          validation: "cuid2",
          code: q.invalid_string,
          message: n.message
        }), a.dirty());
      else if (n.kind === "ulid")
        Ac.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
          validation: "ulid",
          code: q.invalid_string,
          message: n.message
        }), a.dirty());
      else if (n.kind === "url")
        try {
          new URL(e.data);
        } catch {
          t = this._getOrReturnCtx(e, t), H(t, {
            validation: "url",
            code: q.invalid_string,
            message: n.message
          }), a.dirty();
        }
      else n.kind === "regex" ? (n.regex.lastIndex = 0, n.regex.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
        validation: "regex",
        code: q.invalid_string,
        message: n.message
      }), a.dirty())) : n.kind === "trim" ? e.data = e.data.trim() : n.kind === "includes" ? e.data.includes(n.value, n.position) || (t = this._getOrReturnCtx(e, t), H(t, {
        code: q.invalid_string,
        validation: { includes: n.value, position: n.position },
        message: n.message
      }), a.dirty()) : n.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : n.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : n.kind === "startsWith" ? e.data.startsWith(n.value) || (t = this._getOrReturnCtx(e, t), H(t, {
        code: q.invalid_string,
        validation: { startsWith: n.value },
        message: n.message
      }), a.dirty()) : n.kind === "endsWith" ? e.data.endsWith(n.value) || (t = this._getOrReturnCtx(e, t), H(t, {
        code: q.invalid_string,
        validation: { endsWith: n.value },
        message: n.message
      }), a.dirty()) : n.kind === "datetime" ? ro(n).test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
        code: q.invalid_string,
        validation: "datetime",
        message: n.message
      }), a.dirty()) : n.kind === "date" ? Uc.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
        code: q.invalid_string,
        validation: "date",
        message: n.message
      }), a.dirty()) : n.kind === "time" ? qc(n).test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
        code: q.invalid_string,
        validation: "time",
        message: n.message
      }), a.dirty()) : n.kind === "duration" ? Ic.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
        validation: "duration",
        code: q.invalid_string,
        message: n.message
      }), a.dirty()) : n.kind === "ip" ? zc(e.data, n.version) || (t = this._getOrReturnCtx(e, t), H(t, {
        validation: "ip",
        code: q.invalid_string,
        message: n.message
      }), a.dirty()) : n.kind === "jwt" ? Vc(e.data, n.alg) || (t = this._getOrReturnCtx(e, t), H(t, {
        validation: "jwt",
        code: q.invalid_string,
        message: n.message
      }), a.dirty()) : n.kind === "cidr" ? Hc(e.data, n.version) || (t = this._getOrReturnCtx(e, t), H(t, {
        validation: "cidr",
        code: q.invalid_string,
        message: n.message
      }), a.dirty()) : n.kind === "base64" ? jc.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
        validation: "base64",
        code: q.invalid_string,
        message: n.message
      }), a.dirty()) : n.kind === "base64url" ? Lc.test(e.data) || (t = this._getOrReturnCtx(e, t), H(t, {
        validation: "base64url",
        code: q.invalid_string,
        message: n.message
      }), a.dirty()) : ge.assertNever(n);
    return { status: a.value, value: e.data };
  }
  _regex(e, r, a) {
    return this.refinement((t) => e.test(t), {
      validation: r,
      code: q.invalid_string,
      ...Q.errToObj(a)
    });
  }
  _addCheck(e) {
    return new pt({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...Q.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...Q.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...Q.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...Q.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...Q.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...Q.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...Q.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...Q.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...Q.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...Q.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...Q.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...Q.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...Q.errToObj(e) });
  }
  datetime(e) {
    var r, a;
    return typeof e == "string" ? this._addCheck({
      kind: "datetime",
      precision: null,
      offset: !1,
      local: !1,
      message: e
    }) : this._addCheck({
      kind: "datetime",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      offset: (r = e == null ? void 0 : e.offset) !== null && r !== void 0 ? r : !1,
      local: (a = e == null ? void 0 : e.local) !== null && a !== void 0 ? a : !1,
      ...Q.errToObj(e == null ? void 0 : e.message)
    });
  }
  date(e) {
    return this._addCheck({ kind: "date", message: e });
  }
  time(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      ...Q.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...Q.errToObj(e) });
  }
  regex(e, r) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...Q.errToObj(r)
    });
  }
  includes(e, r) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: r == null ? void 0 : r.position,
      ...Q.errToObj(r == null ? void 0 : r.message)
    });
  }
  startsWith(e, r) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...Q.errToObj(r)
    });
  }
  endsWith(e, r) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...Q.errToObj(r)
    });
  }
  min(e, r) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...Q.errToObj(r)
    });
  }
  max(e, r) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...Q.errToObj(r)
    });
  }
  length(e, r) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...Q.errToObj(r)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, Q.errToObj(e));
  }
  trim() {
    return new pt({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new pt({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new pt({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((e) => e.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((e) => e.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((e) => e.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e) => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((e) => e.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e) => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e) => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e) => e.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((e) => e.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((e) => e.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((e) => e.kind === "base64url");
  }
  get minLength() {
    let e = null;
    for (const r of this._def.checks)
      r.kind === "min" && (e === null || r.value > e) && (e = r.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (const r of this._def.checks)
      r.kind === "max" && (e === null || r.value < e) && (e = r.value);
    return e;
  }
}
pt.create = (s) => {
  var e;
  return new pt({
    checks: [],
    typeName: ee.ZodString,
    coerce: (e = s == null ? void 0 : s.coerce) !== null && e !== void 0 ? e : !1,
    ...ce(s)
  });
};
function Bc(s, e) {
  const r = (s.toString().split(".")[1] || "").length, a = (e.toString().split(".")[1] || "").length, t = r > a ? r : a, n = parseInt(s.toFixed(t).replace(".", "")), o = parseInt(e.toFixed(t).replace(".", ""));
  return n % o / Math.pow(10, t);
}
class Ut extends ue {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== W.number) {
      const n = this._getOrReturnCtx(e);
      return H(n, {
        code: q.invalid_type,
        expected: W.number,
        received: n.parsedType
      }), re;
    }
    let a;
    const t = new Be();
    for (const n of this._def.checks)
      n.kind === "int" ? ge.isInteger(e.data) || (a = this._getOrReturnCtx(e, a), H(a, {
        code: q.invalid_type,
        expected: "integer",
        received: "float",
        message: n.message
      }), t.dirty()) : n.kind === "min" ? (n.inclusive ? e.data < n.value : e.data <= n.value) && (a = this._getOrReturnCtx(e, a), H(a, {
        code: q.too_small,
        minimum: n.value,
        type: "number",
        inclusive: n.inclusive,
        exact: !1,
        message: n.message
      }), t.dirty()) : n.kind === "max" ? (n.inclusive ? e.data > n.value : e.data >= n.value) && (a = this._getOrReturnCtx(e, a), H(a, {
        code: q.too_big,
        maximum: n.value,
        type: "number",
        inclusive: n.inclusive,
        exact: !1,
        message: n.message
      }), t.dirty()) : n.kind === "multipleOf" ? Bc(e.data, n.value) !== 0 && (a = this._getOrReturnCtx(e, a), H(a, {
        code: q.not_multiple_of,
        multipleOf: n.value,
        message: n.message
      }), t.dirty()) : n.kind === "finite" ? Number.isFinite(e.data) || (a = this._getOrReturnCtx(e, a), H(a, {
        code: q.not_finite,
        message: n.message
      }), t.dirty()) : ge.assertNever(n);
    return { status: t.value, value: e.data };
  }
  gte(e, r) {
    return this.setLimit("min", e, !0, Q.toString(r));
  }
  gt(e, r) {
    return this.setLimit("min", e, !1, Q.toString(r));
  }
  lte(e, r) {
    return this.setLimit("max", e, !0, Q.toString(r));
  }
  lt(e, r) {
    return this.setLimit("max", e, !1, Q.toString(r));
  }
  setLimit(e, r, a, t) {
    return new Ut({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: r,
          inclusive: a,
          message: Q.toString(t)
        }
      ]
    });
  }
  _addCheck(e) {
    return new Ut({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: Q.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: Q.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: Q.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: Q.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: Q.toString(e)
    });
  }
  multipleOf(e, r) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: Q.toString(r)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: Q.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: Q.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: Q.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (const r of this._def.checks)
      r.kind === "min" && (e === null || r.value > e) && (e = r.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const r of this._def.checks)
      r.kind === "max" && (e === null || r.value < e) && (e = r.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && ge.isInteger(e.value));
  }
  get isFinite() {
    let e = null, r = null;
    for (const a of this._def.checks) {
      if (a.kind === "finite" || a.kind === "int" || a.kind === "multipleOf")
        return !0;
      a.kind === "min" ? (r === null || a.value > r) && (r = a.value) : a.kind === "max" && (e === null || a.value < e) && (e = a.value);
    }
    return Number.isFinite(r) && Number.isFinite(e);
  }
}
Ut.create = (s) => new Ut({
  checks: [],
  typeName: ee.ZodNumber,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...ce(s)
});
class qt extends ue {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce)
      try {
        e.data = BigInt(e.data);
      } catch {
        return this._getInvalidInput(e);
      }
    if (this._getType(e) !== W.bigint)
      return this._getInvalidInput(e);
    let a;
    const t = new Be();
    for (const n of this._def.checks)
      n.kind === "min" ? (n.inclusive ? e.data < n.value : e.data <= n.value) && (a = this._getOrReturnCtx(e, a), H(a, {
        code: q.too_small,
        type: "bigint",
        minimum: n.value,
        inclusive: n.inclusive,
        message: n.message
      }), t.dirty()) : n.kind === "max" ? (n.inclusive ? e.data > n.value : e.data >= n.value) && (a = this._getOrReturnCtx(e, a), H(a, {
        code: q.too_big,
        type: "bigint",
        maximum: n.value,
        inclusive: n.inclusive,
        message: n.message
      }), t.dirty()) : n.kind === "multipleOf" ? e.data % n.value !== BigInt(0) && (a = this._getOrReturnCtx(e, a), H(a, {
        code: q.not_multiple_of,
        multipleOf: n.value,
        message: n.message
      }), t.dirty()) : ge.assertNever(n);
    return { status: t.value, value: e.data };
  }
  _getInvalidInput(e) {
    const r = this._getOrReturnCtx(e);
    return H(r, {
      code: q.invalid_type,
      expected: W.bigint,
      received: r.parsedType
    }), re;
  }
  gte(e, r) {
    return this.setLimit("min", e, !0, Q.toString(r));
  }
  gt(e, r) {
    return this.setLimit("min", e, !1, Q.toString(r));
  }
  lte(e, r) {
    return this.setLimit("max", e, !0, Q.toString(r));
  }
  lt(e, r) {
    return this.setLimit("max", e, !1, Q.toString(r));
  }
  setLimit(e, r, a, t) {
    return new qt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: r,
          inclusive: a,
          message: Q.toString(t)
        }
      ]
    });
  }
  _addCheck(e) {
    return new qt({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: Q.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: Q.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: Q.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: Q.toString(e)
    });
  }
  multipleOf(e, r) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: Q.toString(r)
    });
  }
  get minValue() {
    let e = null;
    for (const r of this._def.checks)
      r.kind === "min" && (e === null || r.value > e) && (e = r.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const r of this._def.checks)
      r.kind === "max" && (e === null || r.value < e) && (e = r.value);
    return e;
  }
}
qt.create = (s) => {
  var e;
  return new qt({
    checks: [],
    typeName: ee.ZodBigInt,
    coerce: (e = s == null ? void 0 : s.coerce) !== null && e !== void 0 ? e : !1,
    ...ce(s)
  });
};
class Nr extends ue {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== W.boolean) {
      const a = this._getOrReturnCtx(e);
      return H(a, {
        code: q.invalid_type,
        expected: W.boolean,
        received: a.parsedType
      }), re;
    }
    return Ye(e.data);
  }
}
Nr.create = (s) => new Nr({
  typeName: ee.ZodBoolean,
  coerce: (s == null ? void 0 : s.coerce) || !1,
  ...ce(s)
});
class tr extends ue {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== W.date) {
      const n = this._getOrReturnCtx(e);
      return H(n, {
        code: q.invalid_type,
        expected: W.date,
        received: n.parsedType
      }), re;
    }
    if (isNaN(e.data.getTime())) {
      const n = this._getOrReturnCtx(e);
      return H(n, {
        code: q.invalid_date
      }), re;
    }
    const a = new Be();
    let t;
    for (const n of this._def.checks)
      n.kind === "min" ? e.data.getTime() < n.value && (t = this._getOrReturnCtx(e, t), H(t, {
        code: q.too_small,
        message: n.message,
        inclusive: !0,
        exact: !1,
        minimum: n.value,
        type: "date"
      }), a.dirty()) : n.kind === "max" ? e.data.getTime() > n.value && (t = this._getOrReturnCtx(e, t), H(t, {
        code: q.too_big,
        message: n.message,
        inclusive: !0,
        exact: !1,
        maximum: n.value,
        type: "date"
      }), a.dirty()) : ge.assertNever(n);
    return {
      status: a.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new tr({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, r) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: Q.toString(r)
    });
  }
  max(e, r) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: Q.toString(r)
    });
  }
  get minDate() {
    let e = null;
    for (const r of this._def.checks)
      r.kind === "min" && (e === null || r.value > e) && (e = r.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (const r of this._def.checks)
      r.kind === "max" && (e === null || r.value < e) && (e = r.value);
    return e != null ? new Date(e) : null;
  }
}
tr.create = (s) => new tr({
  checks: [],
  coerce: (s == null ? void 0 : s.coerce) || !1,
  typeName: ee.ZodDate,
  ...ce(s)
});
class ha extends ue {
  _parse(e) {
    if (this._getType(e) !== W.symbol) {
      const a = this._getOrReturnCtx(e);
      return H(a, {
        code: q.invalid_type,
        expected: W.symbol,
        received: a.parsedType
      }), re;
    }
    return Ye(e.data);
  }
}
ha.create = (s) => new ha({
  typeName: ee.ZodSymbol,
  ...ce(s)
});
class Mr extends ue {
  _parse(e) {
    if (this._getType(e) !== W.undefined) {
      const a = this._getOrReturnCtx(e);
      return H(a, {
        code: q.invalid_type,
        expected: W.undefined,
        received: a.parsedType
      }), re;
    }
    return Ye(e.data);
  }
}
Mr.create = (s) => new Mr({
  typeName: ee.ZodUndefined,
  ...ce(s)
});
class jr extends ue {
  _parse(e) {
    if (this._getType(e) !== W.null) {
      const a = this._getOrReturnCtx(e);
      return H(a, {
        code: q.invalid_type,
        expected: W.null,
        received: a.parsedType
      }), re;
    }
    return Ye(e.data);
  }
}
jr.create = (s) => new jr({
  typeName: ee.ZodNull,
  ...ce(s)
});
class yr extends ue {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return Ye(e.data);
  }
}
yr.create = (s) => new yr({
  typeName: ee.ZodAny,
  ...ce(s)
});
class Xt extends ue {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return Ye(e.data);
  }
}
Xt.create = (s) => new Xt({
  typeName: ee.ZodUnknown,
  ...ce(s)
});
class Ft extends ue {
  _parse(e) {
    const r = this._getOrReturnCtx(e);
    return H(r, {
      code: q.invalid_type,
      expected: W.never,
      received: r.parsedType
    }), re;
  }
}
Ft.create = (s) => new Ft({
  typeName: ee.ZodNever,
  ...ce(s)
});
class fa extends ue {
  _parse(e) {
    if (this._getType(e) !== W.undefined) {
      const a = this._getOrReturnCtx(e);
      return H(a, {
        code: q.invalid_type,
        expected: W.void,
        received: a.parsedType
      }), re;
    }
    return Ye(e.data);
  }
}
fa.create = (s) => new fa({
  typeName: ee.ZodVoid,
  ...ce(s)
});
class mt extends ue {
  _parse(e) {
    const { ctx: r, status: a } = this._processInputParams(e), t = this._def;
    if (r.parsedType !== W.array)
      return H(r, {
        code: q.invalid_type,
        expected: W.array,
        received: r.parsedType
      }), re;
    if (t.exactLength !== null) {
      const o = r.data.length > t.exactLength.value, i = r.data.length < t.exactLength.value;
      (o || i) && (H(r, {
        code: o ? q.too_big : q.too_small,
        minimum: i ? t.exactLength.value : void 0,
        maximum: o ? t.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: t.exactLength.message
      }), a.dirty());
    }
    if (t.minLength !== null && r.data.length < t.minLength.value && (H(r, {
      code: q.too_small,
      minimum: t.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: t.minLength.message
    }), a.dirty()), t.maxLength !== null && r.data.length > t.maxLength.value && (H(r, {
      code: q.too_big,
      maximum: t.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: t.maxLength.message
    }), a.dirty()), r.common.async)
      return Promise.all([...r.data].map((o, i) => t.type._parseAsync(new Pt(r, o, r.path, i)))).then((o) => Be.mergeArray(a, o));
    const n = [...r.data].map((o, i) => t.type._parseSync(new Pt(r, o, r.path, i)));
    return Be.mergeArray(a, n);
  }
  get element() {
    return this._def.type;
  }
  min(e, r) {
    return new mt({
      ...this._def,
      minLength: { value: e, message: Q.toString(r) }
    });
  }
  max(e, r) {
    return new mt({
      ...this._def,
      maxLength: { value: e, message: Q.toString(r) }
    });
  }
  length(e, r) {
    return new mt({
      ...this._def,
      exactLength: { value: e, message: Q.toString(r) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
mt.create = (s, e) => new mt({
  type: s,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: ee.ZodArray,
  ...ce(e)
});
function nr(s) {
  if (s instanceof xe) {
    const e = {};
    for (const r in s.shape) {
      const a = s.shape[r];
      e[r] = St.create(nr(a));
    }
    return new xe({
      ...s._def,
      shape: () => e
    });
  } else return s instanceof mt ? new mt({
    ...s._def,
    type: nr(s.element)
  }) : s instanceof St ? St.create(nr(s.unwrap())) : s instanceof Vt ? Vt.create(nr(s.unwrap())) : s instanceof Ct ? Ct.create(s.items.map((e) => nr(e))) : s;
}
class xe extends ue {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), r = ge.objectKeys(e);
    return this._cached = { shape: e, keys: r };
  }
  _parse(e) {
    if (this._getType(e) !== W.object) {
      const l = this._getOrReturnCtx(e);
      return H(l, {
        code: q.invalid_type,
        expected: W.object,
        received: l.parsedType
      }), re;
    }
    const { status: a, ctx: t } = this._processInputParams(e), { shape: n, keys: o } = this._getCached(), i = [];
    if (!(this._def.catchall instanceof Ft && this._def.unknownKeys === "strip"))
      for (const l in t.data)
        o.includes(l) || i.push(l);
    const u = [];
    for (const l of o) {
      const h = n[l], f = t.data[l];
      u.push({
        key: { status: "valid", value: l },
        value: h._parse(new Pt(t, f, t.path, l)),
        alwaysSet: l in t.data
      });
    }
    if (this._def.catchall instanceof Ft) {
      const l = this._def.unknownKeys;
      if (l === "passthrough")
        for (const h of i)
          u.push({
            key: { status: "valid", value: h },
            value: { status: "valid", value: t.data[h] }
          });
      else if (l === "strict")
        i.length > 0 && (H(t, {
          code: q.unrecognized_keys,
          keys: i
        }), a.dirty());
      else if (l !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const l = this._def.catchall;
      for (const h of i) {
        const f = t.data[h];
        u.push({
          key: { status: "valid", value: h },
          value: l._parse(
            new Pt(t, f, t.path, h)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: h in t.data
        });
      }
    }
    return t.common.async ? Promise.resolve().then(async () => {
      const l = [];
      for (const h of u) {
        const f = await h.key, p = await h.value;
        l.push({
          key: f,
          value: p,
          alwaysSet: h.alwaysSet
        });
      }
      return l;
    }).then((l) => Be.mergeObjectSync(a, l)) : Be.mergeObjectSync(a, u);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return Q.errToObj, new xe({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (r, a) => {
          var t, n, o, i;
          const u = (o = (n = (t = this._def).errorMap) === null || n === void 0 ? void 0 : n.call(t, r, a).message) !== null && o !== void 0 ? o : a.defaultError;
          return r.code === "unrecognized_keys" ? {
            message: (i = Q.errToObj(e).message) !== null && i !== void 0 ? i : u
          } : {
            message: u
          };
        }
      } : {}
    });
  }
  strip() {
    return new xe({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new xe({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(e) {
    return new xe({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...e
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(e) {
    return new xe({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: ee.ZodObject
    });
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(e, r) {
    return this.augment({ [e]: r });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(e) {
    return new xe({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const r = {};
    return ge.objectKeys(e).forEach((a) => {
      e[a] && this.shape[a] && (r[a] = this.shape[a]);
    }), new xe({
      ...this._def,
      shape: () => r
    });
  }
  omit(e) {
    const r = {};
    return ge.objectKeys(this.shape).forEach((a) => {
      e[a] || (r[a] = this.shape[a]);
    }), new xe({
      ...this._def,
      shape: () => r
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return nr(this);
  }
  partial(e) {
    const r = {};
    return ge.objectKeys(this.shape).forEach((a) => {
      const t = this.shape[a];
      e && !e[a] ? r[a] = t : r[a] = t.optional();
    }), new xe({
      ...this._def,
      shape: () => r
    });
  }
  required(e) {
    const r = {};
    return ge.objectKeys(this.shape).forEach((a) => {
      if (e && !e[a])
        r[a] = this.shape[a];
      else {
        let n = this.shape[a];
        for (; n instanceof St;)
          n = n._def.innerType;
        r[a] = n;
      }
    }), new xe({
      ...this._def,
      shape: () => r
    });
  }
  keyof() {
    return ao(ge.objectKeys(this.shape));
  }
}
xe.create = (s, e) => new xe({
  shape: () => s,
  unknownKeys: "strip",
  catchall: Ft.create(),
  typeName: ee.ZodObject,
  ...ce(e)
});
xe.strictCreate = (s, e) => new xe({
  shape: () => s,
  unknownKeys: "strict",
  catchall: Ft.create(),
  typeName: ee.ZodObject,
  ...ce(e)
});
xe.lazycreate = (s, e) => new xe({
  shape: s,
  unknownKeys: "strip",
  catchall: Ft.create(),
  typeName: ee.ZodObject,
  ...ce(e)
});
class Lr extends ue {
  _parse(e) {
    const { ctx: r } = this._processInputParams(e), a = this._def.options;
    function t(n) {
      for (const i of n)
        if (i.result.status === "valid")
          return i.result;
      for (const i of n)
        if (i.result.status === "dirty")
          return r.common.issues.push(...i.ctx.common.issues), i.result;
      const o = n.map((i) => new at(i.ctx.common.issues));
      return H(r, {
        code: q.invalid_union,
        unionErrors: o
      }), re;
    }
    if (r.common.async)
      return Promise.all(a.map(async (n) => {
        const o = {
          ...r,
          common: {
            ...r.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await n._parseAsync({
            data: r.data,
            path: r.path,
            parent: o
          }),
          ctx: o
        };
      })).then(t);
    {
      let n;
      const o = [];
      for (const u of a) {
        const l = {
          ...r,
          common: {
            ...r.common,
            issues: []
          },
          parent: null
        }, h = u._parseSync({
          data: r.data,
          path: r.path,
          parent: l
        });
        if (h.status === "valid")
          return h;
        h.status === "dirty" && !n && (n = { result: h, ctx: l }), l.common.issues.length && o.push(l.common.issues);
      }
      if (n)
        return r.common.issues.push(...n.ctx.common.issues), n.result;
      const i = o.map((u) => new at(u));
      return H(r, {
        code: q.invalid_union,
        unionErrors: i
      }), re;
    }
  }
  get options() {
    return this._def.options;
  }
}
Lr.create = (s, e) => new Lr({
  options: s,
  typeName: ee.ZodUnion,
  ...ce(e)
});
const kt = (s) => s instanceof zr ? kt(s.schema) : s instanceof gt ? kt(s.innerType()) : s instanceof Vr ? [s.value] : s instanceof zt ? s.options : s instanceof Hr ? ge.objectValues(s.enum) : s instanceof Br ? kt(s._def.innerType) : s instanceof Mr ? [void 0] : s instanceof jr ? [null] : s instanceof St ? [void 0, ...kt(s.unwrap())] : s instanceof Vt ? [null, ...kt(s.unwrap())] : s instanceof cn || s instanceof Wr ? kt(s.unwrap()) : s instanceof Zr ? kt(s._def.innerType) : [];
class wa extends ue {
  _parse(e) {
    const { ctx: r } = this._processInputParams(e);
    if (r.parsedType !== W.object)
      return H(r, {
        code: q.invalid_type,
        expected: W.object,
        received: r.parsedType
      }), re;
    const a = this.discriminator, t = r.data[a], n = this.optionsMap.get(t);
    return n ? r.common.async ? n._parseAsync({
      data: r.data,
      path: r.path,
      parent: r
    }) : n._parseSync({
      data: r.data,
      path: r.path,
      parent: r
    }) : (H(r, {
      code: q.invalid_union_discriminator,
      options: Array.from(this.optionsMap.keys()),
      path: [a]
    }), re);
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(e, r, a) {
    const t = /* @__PURE__ */ new Map();
    for (const n of r) {
      const o = kt(n.shape[e]);
      if (!o.length)
        throw new Error(`A discriminator value for key \`${e}\` could not be extracted from all schema options`);
      for (const i of o) {
        if (t.has(i))
          throw new Error(`Discriminator property ${String(e)} has duplicate value ${String(i)}`);
        t.set(i, n);
      }
    }
    return new wa({
      typeName: ee.ZodDiscriminatedUnion,
      discriminator: e,
      options: r,
      optionsMap: t,
      ...ce(a)
    });
  }
}
function Os(s, e) {
  const r = Ot(s), a = Ot(e);
  if (s === e)
    return { valid: !0, data: s };
  if (r === W.object && a === W.object) {
    const t = ge.objectKeys(e), n = ge.objectKeys(s).filter((i) => t.indexOf(i) !== -1), o = { ...s, ...e };
    for (const i of n) {
      const u = Os(s[i], e[i]);
      if (!u.valid)
        return { valid: !1 };
      o[i] = u.data;
    }
    return { valid: !0, data: o };
  } else if (r === W.array && a === W.array) {
    if (s.length !== e.length)
      return { valid: !1 };
    const t = [];
    for (let n = 0; n < s.length; n++) {
      const o = s[n], i = e[n], u = Os(o, i);
      if (!u.valid)
        return { valid: !1 };
      t.push(u.data);
    }
    return { valid: !0, data: t };
  } else return r === W.date && a === W.date && +s == +e ? { valid: !0, data: s } : { valid: !1 };
}
class Ur extends ue {
  _parse(e) {
    const { status: r, ctx: a } = this._processInputParams(e), t = (n, o) => {
      if (Is(n) || Is(o))
        return re;
      const i = Os(n.value, o.value);
      return i.valid ? (($s(n) || $s(o)) && r.dirty(), { status: r.value, value: i.data }) : (H(a, {
        code: q.invalid_intersection_types
      }), re);
    };
    return a.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: a.data,
        path: a.path,
        parent: a
      }),
      this._def.right._parseAsync({
        data: a.data,
        path: a.path,
        parent: a
      })
    ]).then(([n, o]) => t(n, o)) : t(this._def.left._parseSync({
      data: a.data,
      path: a.path,
      parent: a
    }), this._def.right._parseSync({
      data: a.data,
      path: a.path,
      parent: a
    }));
  }
}
Ur.create = (s, e, r) => new Ur({
  left: s,
  right: e,
  typeName: ee.ZodIntersection,
  ...ce(r)
});
class Ct extends ue {
  _parse(e) {
    const { status: r, ctx: a } = this._processInputParams(e);
    if (a.parsedType !== W.array)
      return H(a, {
        code: q.invalid_type,
        expected: W.array,
        received: a.parsedType
      }), re;
    if (a.data.length < this._def.items.length)
      return H(a, {
        code: q.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), re;
    !this._def.rest && a.data.length > this._def.items.length && (H(a, {
      code: q.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), r.dirty());
    const n = [...a.data].map((o, i) => {
      const u = this._def.items[i] || this._def.rest;
      return u ? u._parse(new Pt(a, o, a.path, i)) : null;
    }).filter((o) => !!o);
    return a.common.async ? Promise.all(n).then((o) => Be.mergeArray(r, o)) : Be.mergeArray(r, n);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new Ct({
      ...this._def,
      rest: e
    });
  }
}
Ct.create = (s, e) => {
  if (!Array.isArray(s))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new Ct({
    items: s,
    typeName: ee.ZodTuple,
    rest: null,
    ...ce(e)
  });
};
class qr extends ue {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: r, ctx: a } = this._processInputParams(e);
    if (a.parsedType !== W.object)
      return H(a, {
        code: q.invalid_type,
        expected: W.object,
        received: a.parsedType
      }), re;
    const t = [], n = this._def.keyType, o = this._def.valueType;
    for (const i in a.data)
      t.push({
        key: n._parse(new Pt(a, i, a.path, i)),
        value: o._parse(new Pt(a, a.data[i], a.path, i)),
        alwaysSet: i in a.data
      });
    return a.common.async ? Be.mergeObjectAsync(r, t) : Be.mergeObjectSync(r, t);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, r, a) {
    return r instanceof ue ? new qr({
      keyType: e,
      valueType: r,
      typeName: ee.ZodRecord,
      ...ce(a)
    }) : new qr({
      keyType: pt.create(),
      valueType: e,
      typeName: ee.ZodRecord,
      ...ce(r)
    });
  }
}
class pa extends ue {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: r, ctx: a } = this._processInputParams(e);
    if (a.parsedType !== W.map)
      return H(a, {
        code: q.invalid_type,
        expected: W.map,
        received: a.parsedType
      }), re;
    const t = this._def.keyType, n = this._def.valueType, o = [...a.data.entries()].map(([i, u], l) => ({
      key: t._parse(new Pt(a, i, a.path, [l, "key"])),
      value: n._parse(new Pt(a, u, a.path, [l, "value"]))
    }));
    if (a.common.async) {
      const i = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const u of o) {
          const l = await u.key, h = await u.value;
          if (l.status === "aborted" || h.status === "aborted")
            return re;
          (l.status === "dirty" || h.status === "dirty") && r.dirty(), i.set(l.value, h.value);
        }
        return { status: r.value, value: i };
      });
    } else {
      const i = /* @__PURE__ */ new Map();
      for (const u of o) {
        const l = u.key, h = u.value;
        if (l.status === "aborted" || h.status === "aborted")
          return re;
        (l.status === "dirty" || h.status === "dirty") && r.dirty(), i.set(l.value, h.value);
      }
      return { status: r.value, value: i };
    }
  }
}
pa.create = (s, e, r) => new pa({
  valueType: e,
  keyType: s,
  typeName: ee.ZodMap,
  ...ce(r)
});
class rr extends ue {
  _parse(e) {
    const { status: r, ctx: a } = this._processInputParams(e);
    if (a.parsedType !== W.set)
      return H(a, {
        code: q.invalid_type,
        expected: W.set,
        received: a.parsedType
      }), re;
    const t = this._def;
    t.minSize !== null && a.data.size < t.minSize.value && (H(a, {
      code: q.too_small,
      minimum: t.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: t.minSize.message
    }), r.dirty()), t.maxSize !== null && a.data.size > t.maxSize.value && (H(a, {
      code: q.too_big,
      maximum: t.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: t.maxSize.message
    }), r.dirty());
    const n = this._def.valueType;
    function o(u) {
      const l = /* @__PURE__ */ new Set();
      for (const h of u) {
        if (h.status === "aborted")
          return re;
        h.status === "dirty" && r.dirty(), l.add(h.value);
      }
      return { status: r.value, value: l };
    }
    const i = [...a.data.values()].map((u, l) => n._parse(new Pt(a, u, a.path, l)));
    return a.common.async ? Promise.all(i).then((u) => o(u)) : o(i);
  }
  min(e, r) {
    return new rr({
      ...this._def,
      minSize: { value: e, message: Q.toString(r) }
    });
  }
  max(e, r) {
    return new rr({
      ...this._def,
      maxSize: { value: e, message: Q.toString(r) }
    });
  }
  size(e, r) {
    return this.min(e, r).max(e, r);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
rr.create = (s, e) => new rr({
  valueType: s,
  minSize: null,
  maxSize: null,
  typeName: ee.ZodSet,
  ...ce(e)
});
class hr extends ue {
  constructor() {
    super(...arguments), this.validate = this.implement;
  }
  _parse(e) {
    const { ctx: r } = this._processInputParams(e);
    if (r.parsedType !== W.function)
      return H(r, {
        code: q.invalid_type,
        expected: W.function,
        received: r.parsedType
      }), re;
    function a(i, u) {
      return ua({
        data: i,
        path: r.path,
        errorMaps: [
          r.common.contextualErrorMap,
          r.schemaErrorMap,
          la(),
          vr
        ].filter((l) => !!l),
        issueData: {
          code: q.invalid_arguments,
          argumentsError: u
        }
      });
    }
    function t(i, u) {
      return ua({
        data: i,
        path: r.path,
        errorMaps: [
          r.common.contextualErrorMap,
          r.schemaErrorMap,
          la(),
          vr
        ].filter((l) => !!l),
        issueData: {
          code: q.invalid_return_type,
          returnTypeError: u
        }
      });
    }
    const n = { errorMap: r.common.contextualErrorMap }, o = r.data;
    if (this._def.returns instanceof _r) {
      const i = this;
      return Ye(async function (...u) {
        const l = new at([]), h = await i._def.args.parseAsync(u, n).catch((d) => {
          throw l.addIssue(a(u, d)), l;
        }), f = await Reflect.apply(o, this, h);
        return await i._def.returns._def.type.parseAsync(f, n).catch((d) => {
          throw l.addIssue(t(f, d)), l;
        });
      });
    } else {
      const i = this;
      return Ye(function (...u) {
        const l = i._def.args.safeParse(u, n);
        if (!l.success)
          throw new at([a(u, l.error)]);
        const h = Reflect.apply(o, this, l.data), f = i._def.returns.safeParse(h, n);
        if (!f.success)
          throw new at([t(h, f.error)]);
        return f.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...e) {
    return new hr({
      ...this._def,
      args: Ct.create(e).rest(Xt.create())
    });
  }
  returns(e) {
    return new hr({
      ...this._def,
      returns: e
    });
  }
  implement(e) {
    return this.parse(e);
  }
  strictImplement(e) {
    return this.parse(e);
  }
  static create(e, r, a) {
    return new hr({
      args: e || Ct.create([]).rest(Xt.create()),
      returns: r || Xt.create(),
      typeName: ee.ZodFunction,
      ...ce(a)
    });
  }
}
class zr extends ue {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: r } = this._processInputParams(e);
    return this._def.getter()._parse({ data: r.data, path: r.path, parent: r });
  }
}
zr.create = (s, e) => new zr({
  getter: s,
  typeName: ee.ZodLazy,
  ...ce(e)
});
class Vr extends ue {
  _parse(e) {
    if (e.data !== this._def.value) {
      const r = this._getOrReturnCtx(e);
      return H(r, {
        received: r.data,
        code: q.invalid_literal,
        expected: this._def.value
      }), re;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
Vr.create = (s, e) => new Vr({
  value: s,
  typeName: ee.ZodLiteral,
  ...ce(e)
});
function ao(s, e) {
  return new zt({
    values: s,
    typeName: ee.ZodEnum,
    ...ce(e)
  });
}
class zt extends ue {
  constructor() {
    super(...arguments), xr.set(this, void 0);
  }
  _parse(e) {
    if (typeof e.data != "string") {
      const r = this._getOrReturnCtx(e), a = this._def.values;
      return H(r, {
        expected: ge.joinValues(a),
        received: r.parsedType,
        code: q.invalid_type
      }), re;
    }
    if (da(this, xr) || Xi(this, xr, new Set(this._def.values)), !da(this, xr).has(e.data)) {
      const r = this._getOrReturnCtx(e), a = this._def.values;
      return H(r, {
        received: r.data,
        code: q.invalid_enum_value,
        options: a
      }), re;
    }
    return Ye(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const e = {};
    for (const r of this._def.values)
      e[r] = r;
    return e;
  }
  get Values() {
    const e = {};
    for (const r of this._def.values)
      e[r] = r;
    return e;
  }
  get Enum() {
    const e = {};
    for (const r of this._def.values)
      e[r] = r;
    return e;
  }
  extract(e, r = this._def) {
    return zt.create(e, {
      ...this._def,
      ...r
    });
  }
  exclude(e, r = this._def) {
    return zt.create(this.options.filter((a) => !e.includes(a)), {
      ...this._def,
      ...r
    });
  }
}
xr = /* @__PURE__ */ new WeakMap();
zt.create = ao;
class Hr extends ue {
  constructor() {
    super(...arguments), Ar.set(this, void 0);
  }
  _parse(e) {
    const r = ge.getValidEnumValues(this._def.values), a = this._getOrReturnCtx(e);
    if (a.parsedType !== W.string && a.parsedType !== W.number) {
      const t = ge.objectValues(r);
      return H(a, {
        expected: ge.joinValues(t),
        received: a.parsedType,
        code: q.invalid_type
      }), re;
    }
    if (da(this, Ar) || Xi(this, Ar, new Set(ge.getValidEnumValues(this._def.values))), !da(this, Ar).has(e.data)) {
      const t = ge.objectValues(r);
      return H(a, {
        received: a.data,
        code: q.invalid_enum_value,
        options: t
      }), re;
    }
    return Ye(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Ar = /* @__PURE__ */ new WeakMap();
Hr.create = (s, e) => new Hr({
  values: s,
  typeName: ee.ZodNativeEnum,
  ...ce(e)
});
class _r extends ue {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: r } = this._processInputParams(e);
    if (r.parsedType !== W.promise && r.common.async === !1)
      return H(r, {
        code: q.invalid_type,
        expected: W.promise,
        received: r.parsedType
      }), re;
    const a = r.parsedType === W.promise ? r.data : Promise.resolve(r.data);
    return Ye(a.then((t) => this._def.type.parseAsync(t, {
      path: r.path,
      errorMap: r.common.contextualErrorMap
    })));
  }
}
_r.create = (s, e) => new _r({
  type: s,
  typeName: ee.ZodPromise,
  ...ce(e)
});
class gt extends ue {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ee.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: r, ctx: a } = this._processInputParams(e), t = this._def.effect || null, n = {
      addIssue: (o) => {
        H(a, o), o.fatal ? r.abort() : r.dirty();
      },
      get path() {
        return a.path;
      }
    };
    if (n.addIssue = n.addIssue.bind(n), t.type === "preprocess") {
      const o = t.transform(a.data, n);
      if (a.common.async)
        return Promise.resolve(o).then(async (i) => {
          if (r.value === "aborted")
            return re;
          const u = await this._def.schema._parseAsync({
            data: i,
            path: a.path,
            parent: a
          });
          return u.status === "aborted" ? re : u.status === "dirty" || r.value === "dirty" ? lr(u.value) : u;
        });
      {
        if (r.value === "aborted")
          return re;
        const i = this._def.schema._parseSync({
          data: o,
          path: a.path,
          parent: a
        });
        return i.status === "aborted" ? re : i.status === "dirty" || r.value === "dirty" ? lr(i.value) : i;
      }
    }
    if (t.type === "refinement") {
      const o = (i) => {
        const u = t.refinement(i, n);
        if (a.common.async)
          return Promise.resolve(u);
        if (u instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return i;
      };
      if (a.common.async === !1) {
        const i = this._def.schema._parseSync({
          data: a.data,
          path: a.path,
          parent: a
        });
        return i.status === "aborted" ? re : (i.status === "dirty" && r.dirty(), o(i.value), { status: r.value, value: i.value });
      } else
        return this._def.schema._parseAsync({ data: a.data, path: a.path, parent: a }).then((i) => i.status === "aborted" ? re : (i.status === "dirty" && r.dirty(), o(i.value).then(() => ({ status: r.value, value: i.value }))));
    }
    if (t.type === "transform")
      if (a.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: a.data,
          path: a.path,
          parent: a
        });
        if (!er(o))
          return o;
        const i = t.transform(o.value, n);
        if (i instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: r.value, value: i };
      } else
        return this._def.schema._parseAsync({ data: a.data, path: a.path, parent: a }).then((o) => er(o) ? Promise.resolve(t.transform(o.value, n)).then((i) => ({ status: r.value, value: i })) : o);
    ge.assertNever(t);
  }
}
gt.create = (s, e, r) => new gt({
  schema: s,
  typeName: ee.ZodEffects,
  effect: e,
  ...ce(r)
});
gt.createWithPreprocess = (s, e, r) => new gt({
  schema: e,
  effect: { type: "preprocess", transform: s },
  typeName: ee.ZodEffects,
  ...ce(r)
});
class St extends ue {
  _parse(e) {
    return this._getType(e) === W.undefined ? Ye(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
St.create = (s, e) => new St({
  innerType: s,
  typeName: ee.ZodOptional,
  ...ce(e)
});
class Vt extends ue {
  _parse(e) {
    return this._getType(e) === W.null ? Ye(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Vt.create = (s, e) => new Vt({
  innerType: s,
  typeName: ee.ZodNullable,
  ...ce(e)
});
class Br extends ue {
  _parse(e) {
    const { ctx: r } = this._processInputParams(e);
    let a = r.data;
    return r.parsedType === W.undefined && (a = this._def.defaultValue()), this._def.innerType._parse({
      data: a,
      path: r.path,
      parent: r
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
Br.create = (s, e) => new Br({
  innerType: s,
  typeName: ee.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...ce(e)
});
class Zr extends ue {
  _parse(e) {
    const { ctx: r } = this._processInputParams(e), a = {
      ...r,
      common: {
        ...r.common,
        issues: []
      }
    }, t = this._def.innerType._parse({
      data: a.data,
      path: a.path,
      parent: {
        ...a
      }
    });
    return Fr(t) ? t.then((n) => ({
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new at(a.common.issues);
        },
        input: a.data
      })
    })) : {
      status: "valid",
      value: t.status === "valid" ? t.value : this._def.catchValue({
        get error() {
          return new at(a.common.issues);
        },
        input: a.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
Zr.create = (s, e) => new Zr({
  innerType: s,
  typeName: ee.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...ce(e)
});
class ma extends ue {
  _parse(e) {
    if (this._getType(e) !== W.nan) {
      const a = this._getOrReturnCtx(e);
      return H(a, {
        code: q.invalid_type,
        expected: W.nan,
        received: a.parsedType
      }), re;
    }
    return { status: "valid", value: e.data };
  }
}
ma.create = (s) => new ma({
  typeName: ee.ZodNaN,
  ...ce(s)
});
const Zc = Symbol("zod_brand");
class cn extends ue {
  _parse(e) {
    const { ctx: r } = this._processInputParams(e), a = r.data;
    return this._def.type._parse({
      data: a,
      path: r.path,
      parent: r
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class Gr extends ue {
  _parse(e) {
    const { status: r, ctx: a } = this._processInputParams(e);
    if (a.common.async)
      return (async () => {
        const n = await this._def.in._parseAsync({
          data: a.data,
          path: a.path,
          parent: a
        });
        return n.status === "aborted" ? re : n.status === "dirty" ? (r.dirty(), lr(n.value)) : this._def.out._parseAsync({
          data: n.value,
          path: a.path,
          parent: a
        });
      })();
    {
      const t = this._def.in._parseSync({
        data: a.data,
        path: a.path,
        parent: a
      });
      return t.status === "aborted" ? re : t.status === "dirty" ? (r.dirty(), {
        status: "dirty",
        value: t.value
      }) : this._def.out._parseSync({
        data: t.value,
        path: a.path,
        parent: a
      });
    }
  }
  static create(e, r) {
    return new Gr({
      in: e,
      out: r,
      typeName: ee.ZodPipeline
    });
  }
}
class Wr extends ue {
  _parse(e) {
    const r = this._def.innerType._parse(e), a = (t) => (er(t) && (t.value = Object.freeze(t.value)), t);
    return Fr(r) ? r.then((t) => a(t)) : a(r);
  }
  unwrap() {
    return this._def.innerType;
  }
}
Wr.create = (s, e) => new Wr({
  innerType: s,
  typeName: ee.ZodReadonly,
  ...ce(e)
});
function Hn(s, e) {
  const r = typeof s == "function" ? s(e) : typeof s == "string" ? { message: s } : s;
  return typeof r == "string" ? { message: r } : r;
}
function so(s, e = {}, r) {
  return s ? yr.create().superRefine((a, t) => {
    var n, o;
    const i = s(a);
    if (i instanceof Promise)
      return i.then((u) => {
        var l, h;
        if (!u) {
          const f = Hn(e, a), p = (h = (l = f.fatal) !== null && l !== void 0 ? l : r) !== null && h !== void 0 ? h : !0;
          t.addIssue({ code: "custom", ...f, fatal: p });
        }
      });
    if (!i) {
      const u = Hn(e, a), l = (o = (n = u.fatal) !== null && n !== void 0 ? n : r) !== null && o !== void 0 ? o : !0;
      t.addIssue({ code: "custom", ...u, fatal: l });
    }
  }) : yr.create();
}
const Wc = {
  object: xe.lazycreate
};
var ee;
(function (s) {
  s.ZodString = "ZodString", s.ZodNumber = "ZodNumber", s.ZodNaN = "ZodNaN", s.ZodBigInt = "ZodBigInt", s.ZodBoolean = "ZodBoolean", s.ZodDate = "ZodDate", s.ZodSymbol = "ZodSymbol", s.ZodUndefined = "ZodUndefined", s.ZodNull = "ZodNull", s.ZodAny = "ZodAny", s.ZodUnknown = "ZodUnknown", s.ZodNever = "ZodNever", s.ZodVoid = "ZodVoid", s.ZodArray = "ZodArray", s.ZodObject = "ZodObject", s.ZodUnion = "ZodUnion", s.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", s.ZodIntersection = "ZodIntersection", s.ZodTuple = "ZodTuple", s.ZodRecord = "ZodRecord", s.ZodMap = "ZodMap", s.ZodSet = "ZodSet", s.ZodFunction = "ZodFunction", s.ZodLazy = "ZodLazy", s.ZodLiteral = "ZodLiteral", s.ZodEnum = "ZodEnum", s.ZodEffects = "ZodEffects", s.ZodNativeEnum = "ZodNativeEnum", s.ZodOptional = "ZodOptional", s.ZodNullable = "ZodNullable", s.ZodDefault = "ZodDefault", s.ZodCatch = "ZodCatch", s.ZodPromise = "ZodPromise", s.ZodBranded = "ZodBranded", s.ZodPipeline = "ZodPipeline", s.ZodReadonly = "ZodReadonly";
})(ee || (ee = {}));
const Qc = (s, e = {
  message: `Input not instance of ${s.name}`
}) => so((r) => r instanceof s, e), no = pt.create, io = Ut.create, Gc = ma.create, Jc = qt.create, oo = Nr.create, Kc = tr.create, Yc = ha.create, Xc = Mr.create, el = jr.create, tl = yr.create, rl = Xt.create, al = Ft.create, sl = fa.create, nl = mt.create, il = xe.create, ol = xe.strictCreate, cl = Lr.create, ll = wa.create, ul = Ur.create, dl = Ct.create, hl = qr.create, fl = pa.create, pl = rr.create, ml = hr.create, gl = zr.create, vl = Vr.create, yl = zt.create, _l = Hr.create, bl = _r.create, Bn = gt.create, wl = St.create, El = Vt.create, Sl = gt.createWithPreprocess, Pl = Gr.create, Cl = () => no().optional(), xl = () => io().optional(), Al = () => oo().optional(), Rl = {
  string: (s) => pt.create({ ...s, coerce: !0 }),
  number: (s) => Ut.create({ ...s, coerce: !0 }),
  boolean: (s) => Nr.create({
    ...s,
    coerce: !0
  }),
  bigint: (s) => qt.create({ ...s, coerce: !0 }),
  date: (s) => tr.create({ ...s, coerce: !0 })
}, Tl = re;
var c = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: vr,
  setErrorMap: Sc,
  getErrorMap: la,
  makeIssue: ua,
  EMPTY_PATH: Pc,
  addIssueToContext: H,
  ParseStatus: Be,
  INVALID: re,
  DIRTY: lr,
  OK: Ye,
  isAborted: Is,
  isDirty: $s,
  isValid: er,
  isAsync: Fr,
  get util() {
    return ge;
  },
  get objectUtil() {
    return ks;
  },
  ZodParsedType: W,
  getParsedType: Ot,
  ZodType: ue,
  datetimeRegex: ro,
  ZodString: pt,
  ZodNumber: Ut,
  ZodBigInt: qt,
  ZodBoolean: Nr,
  ZodDate: tr,
  ZodSymbol: ha,
  ZodUndefined: Mr,
  ZodNull: jr,
  ZodAny: yr,
  ZodUnknown: Xt,
  ZodNever: Ft,
  ZodVoid: fa,
  ZodArray: mt,
  ZodObject: xe,
  ZodUnion: Lr,
  ZodDiscriminatedUnion: wa,
  ZodIntersection: Ur,
  ZodTuple: Ct,
  ZodRecord: qr,
  ZodMap: pa,
  ZodSet: rr,
  ZodFunction: hr,
  ZodLazy: zr,
  ZodLiteral: Vr,
  ZodEnum: zt,
  ZodNativeEnum: Hr,
  ZodPromise: _r,
  ZodEffects: gt,
  ZodTransformer: gt,
  ZodOptional: St,
  ZodNullable: Vt,
  ZodDefault: Br,
  ZodCatch: Zr,
  ZodNaN: ma,
  BRAND: Zc,
  ZodBranded: cn,
  ZodPipeline: Gr,
  ZodReadonly: Wr,
  custom: so,
  Schema: ue,
  ZodSchema: ue,
  late: Wc,
  get ZodFirstPartyTypeKind() {
    return ee;
  },
  coerce: Rl,
  any: tl,
  array: nl,
  bigint: Jc,
  boolean: oo,
  date: Kc,
  discriminatedUnion: ll,
  effect: Bn,
  enum: yl,
  function: ml,
  instanceof: Qc,
  intersection: ul,
  lazy: gl,
  literal: vl,
  map: fl,
  nan: Gc,
  nativeEnum: _l,
  never: al,
  null: el,
  nullable: El,
  number: io,
  object: il,
  oboolean: Al,
  onumber: xl,
  optional: wl,
  ostring: Cl,
  pipeline: Pl,
  preprocess: Sl,
  promise: bl,
  record: hl,
  set: pl,
  strictObject: ol,
  string: no,
  symbol: Yc,
  transformer: Bn,
  tuple: dl,
  undefined: Xc,
  union: cl,
  unknown: rl,
  void: sl,
  NEVER: Tl,
  ZodIssueCode: q,
  quotelessJson: Ec,
  ZodError: at
});
const Ea = "2025-06-18", kl = [Ea, "2025-03-26", "2024-11-05", "2024-10-07"], Sa = "2.0", co = c.union([c.string(), c.number().int()]), lo = c.string(), Il = c.object({
  /**
   * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
   */
  progressToken: c.optional(co)
}).passthrough(), lt = c.object({
  _meta: c.optional(Il)
}).passthrough(), rt = c.object({
  method: c.string(),
  params: c.optional(lt)
}), Jr = c.object({
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).passthrough(), xt = c.object({
  method: c.string(),
  params: c.optional(Jr)
}), ut = c.object({
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).passthrough(), Pa = c.union([c.string(), c.number().int()]), uo = c.object({
  jsonrpc: c.literal(Sa),
  id: Pa
}).merge(rt).strict(), ho = (s) => uo.safeParse(s).success, fo = c.object({
  jsonrpc: c.literal(Sa)
}).merge(xt).strict(), $l = (s) => fo.safeParse(s).success, po = c.object({
  jsonrpc: c.literal(Sa),
  id: Pa,
  result: ut
}).strict(), Ds = (s) => po.safeParse(s).success;
var wt;
(function (s) {
  s[s.ConnectionClosed = -32e3] = "ConnectionClosed", s[s.RequestTimeout = -32001] = "RequestTimeout", s[s.ParseError = -32700] = "ParseError", s[s.InvalidRequest = -32600] = "InvalidRequest", s[s.MethodNotFound = -32601] = "MethodNotFound", s[s.InvalidParams = -32602] = "InvalidParams", s[s.InternalError = -32603] = "InternalError";
})(wt || (wt = {}));
const mo = c.object({
  jsonrpc: c.literal(Sa),
  id: Pa,
  error: c.object({
    /**
     * The error type that occurred.
     */
    code: c.number().int(),
    /**
     * A short description of the error. The message SHOULD be limited to a concise single sentence.
     */
    message: c.string(),
    /**
     * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    data: c.optional(c.unknown())
  })
}).strict(), Ol = (s) => mo.safeParse(s).success, ia = c.union([uo, fo, po, mo]), ur = ut.strict(), ln = xt.extend({
  method: c.literal("notifications/cancelled"),
  params: Jr.extend({
    /**
     * The ID of the request to cancel.
     *
     * This MUST correspond to the ID of a request previously issued in the same direction.
     */
    requestId: Pa,
    /**
     * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
     */
    reason: c.string().optional()
  })
}), Dl = c.object({
  /**
   * URL or data URI for the icon.
   */
  src: c.string(),
  /**
   * Optional MIME type for the icon.
   */
  mimeType: c.optional(c.string()),
  /**
   * Optional array of strings that specify sizes at which the icon can be used.
   * Each string should be in WxH format (e.g., `"48x48"`, `"96x96"`) or `"any"` for scalable formats like SVG.
   *
   * If not provided, the client should assume that the icon can be used at any size.
   */
  sizes: c.optional(c.array(c.string()))
}).passthrough(), Kr = c.object({
  /**
   * Optional set of sized icons that the client can display in a user interface.
   *
   * Clients that support rendering icons MUST support at least the following MIME types:
   * - `image/png` - PNG images (safe, universal compatibility)
   * - `image/jpeg` (and `image/jpg`) - JPEG images (safe, universal compatibility)
   *
   * Clients that support rendering icons SHOULD also support:
   * - `image/svg+xml` - SVG images (scalable but requires security precautions)
   * - `image/webp` - WebP images (modern, efficient format)
   */
  icons: c.array(Dl).optional()
}).passthrough(), Yr = c.object({
  /** Intended for programmatic or logical use, but used as a display name in past specs or fallback */
  name: c.string(),
  /**
   * Intended for UI and end-user contexts — optimized to be human-readable and easily understood,
   * even by those unfamiliar with domain-specific terminology.
   *
   * If not provided, the name should be used for display (except for Tool,
   * where `annotations.title` should be given precedence over using `name`,
   * if present).
   */
  title: c.optional(c.string())
}).passthrough(), go = Yr.extend({
  version: c.string(),
  /**
   * An optional URL of the website for this implementation.
   */
  websiteUrl: c.optional(c.string())
}).merge(Kr), Fl = c.object({
  /**
   * Experimental, non-standard capabilities that the client supports.
   */
  experimental: c.optional(c.object({}).passthrough()),
  /**
   * Present if the client supports sampling from an LLM.
   */
  sampling: c.optional(c.object({}).passthrough()),
  /**
   * Present if the client supports eliciting user input.
   */
  elicitation: c.optional(c.object({}).passthrough()),
  /**
   * Present if the client supports listing roots.
   */
  roots: c.optional(c.object({
    /**
     * Whether the client supports issuing notifications for changes to the roots list.
     */
    listChanged: c.optional(c.boolean())
  }).passthrough())
}).passthrough(), Nl = rt.extend({
  method: c.literal("initialize"),
  params: lt.extend({
    /**
     * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
     */
    protocolVersion: c.string(),
    capabilities: Fl,
    clientInfo: go
  })
}), Ml = c.object({
  /**
   * Experimental, non-standard capabilities that the server supports.
   */
  experimental: c.optional(c.object({}).passthrough()),
  /**
   * Present if the server supports sending log messages to the client.
   */
  logging: c.optional(c.object({}).passthrough()),
  /**
   * Present if the server supports sending completions to the client.
   */
  completions: c.optional(c.object({}).passthrough()),
  /**
   * Present if the server offers any prompt templates.
   */
  prompts: c.optional(c.object({
    /**
     * Whether this server supports issuing notifications for changes to the prompt list.
     */
    listChanged: c.optional(c.boolean())
  }).passthrough()),
  /**
   * Present if the server offers any resources to read.
   */
  resources: c.optional(c.object({
    /**
     * Whether this server supports clients subscribing to resource updates.
     */
    subscribe: c.optional(c.boolean()),
    /**
     * Whether this server supports issuing notifications for changes to the resource list.
     */
    listChanged: c.optional(c.boolean())
  }).passthrough()),
  /**
   * Present if the server offers any tools to call.
   */
  tools: c.optional(c.object({
    /**
     * Whether this server supports issuing notifications for changes to the tool list.
     */
    listChanged: c.optional(c.boolean())
  }).passthrough())
}).passthrough(), vo = ut.extend({
  /**
   * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
   */
  protocolVersion: c.string(),
  capabilities: Ml,
  serverInfo: go,
  /**
   * Instructions describing how to use the server and its features.
   *
   * This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a "hint" to the model. For example, this information MAY be added to the system prompt.
   */
  instructions: c.optional(c.string())
}), yo = xt.extend({
  method: c.literal("notifications/initialized")
}), jl = (s) => yo.safeParse(s).success, un = rt.extend({
  method: c.literal("ping")
}), Ll = c.object({
  /**
   * The progress thus far. This should increase every time progress is made, even if the total is unknown.
   */
  progress: c.number(),
  /**
   * Total number of items to process (or total progress required), if known.
   */
  total: c.optional(c.number()),
  /**
   * An optional message describing the current progress.
   */
  message: c.optional(c.string())
}).passthrough(), dn = xt.extend({
  method: c.literal("notifications/progress"),
  params: Jr.merge(Ll).extend({
    /**
     * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
     */
    progressToken: co
  })
}), Ca = rt.extend({
  params: lt.extend({
    /**
     * An opaque token representing the current pagination position.
     * If provided, the server should return results starting after this cursor.
     */
    cursor: c.optional(lo)
  }).optional()
}), xa = ut.extend({
  /**
   * An opaque token representing the pagination position after the last returned result.
   * If present, there may be more results available.
   */
  nextCursor: c.optional(lo)
}), _o = c.object({
  /**
   * The URI of this resource.
   */
  uri: c.string(),
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: c.optional(c.string()),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).passthrough(), bo = _o.extend({
  /**
   * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
   */
  text: c.string()
}), hn = c.string().refine((s) => {
  try {
    return atob(s), !0;
  } catch {
    return !1;
  }
}, { message: "Invalid Base64 string" }), wo = _o.extend({
  /**
   * A base64-encoded string representing the binary data of the item.
   */
  blob: hn
}), Eo = Yr.extend({
  /**
   * The URI of this resource.
   */
  uri: c.string(),
  /**
   * A description of what this resource represents.
   *
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description: c.optional(c.string()),
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: c.optional(c.string()),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).merge(Kr), Ul = Yr.extend({
  /**
   * A URI template (according to RFC 6570) that can be used to construct resource URIs.
   */
  uriTemplate: c.string(),
  /**
   * A description of what this template is for.
   *
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description: c.optional(c.string()),
  /**
   * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
   */
  mimeType: c.optional(c.string()),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).merge(Kr), ql = Ca.extend({
  method: c.literal("resources/list")
}), So = xa.extend({
  resources: c.array(Eo)
}), zl = Ca.extend({
  method: c.literal("resources/templates/list")
}), Po = xa.extend({
  resourceTemplates: c.array(Ul)
}), Vl = rt.extend({
  method: c.literal("resources/read"),
  params: lt.extend({
    /**
     * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
     */
    uri: c.string()
  })
}), Co = ut.extend({
  contents: c.array(c.union([bo, wo]))
}), Hl = xt.extend({
  method: c.literal("notifications/resources/list_changed")
}), Bl = rt.extend({
  method: c.literal("resources/subscribe"),
  params: lt.extend({
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol; it is up to the server how to interpret it.
     */
    uri: c.string()
  })
}), Zl = rt.extend({
  method: c.literal("resources/unsubscribe"),
  params: lt.extend({
    /**
     * The URI of the resource to unsubscribe from.
     */
    uri: c.string()
  })
}), Wl = xt.extend({
  method: c.literal("notifications/resources/updated"),
  params: Jr.extend({
    /**
     * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
     */
    uri: c.string()
  })
}), Ql = c.object({
  /**
   * The name of the argument.
   */
  name: c.string(),
  /**
   * A human-readable description of the argument.
   */
  description: c.optional(c.string()),
  /**
   * Whether this argument must be provided.
   */
  required: c.optional(c.boolean())
}).passthrough(), Gl = Yr.extend({
  /**
   * An optional description of what this prompt provides
   */
  description: c.optional(c.string()),
  /**
   * A list of arguments to use for templating the prompt.
   */
  arguments: c.optional(c.array(Ql)),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).merge(Kr), Jl = Ca.extend({
  method: c.literal("prompts/list")
}), xo = xa.extend({
  prompts: c.array(Gl)
}), Kl = rt.extend({
  method: c.literal("prompts/get"),
  params: lt.extend({
    /**
     * The name of the prompt or prompt template.
     */
    name: c.string(),
    /**
     * Arguments to use for templating the prompt.
     */
    arguments: c.optional(c.record(c.string()))
  })
}), fn = c.object({
  type: c.literal("text"),
  /**
   * The text content of the message.
   */
  text: c.string(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).passthrough(), pn = c.object({
  type: c.literal("image"),
  /**
   * The base64-encoded image data.
   */
  data: hn,
  /**
   * The MIME type of the image. Different providers may support different image types.
   */
  mimeType: c.string(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).passthrough(), mn = c.object({
  type: c.literal("audio"),
  /**
   * The base64-encoded audio data.
   */
  data: hn,
  /**
   * The MIME type of the audio. Different providers may support different audio types.
   */
  mimeType: c.string(),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).passthrough(), Yl = c.object({
  type: c.literal("resource"),
  resource: c.union([bo, wo]),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).passthrough(), Xl = Eo.extend({
  type: c.literal("resource_link")
}), Ao = c.union([
  fn,
  pn,
  mn,
  Xl,
  Yl
]), eu = c.object({
  role: c.enum(["user", "assistant"]),
  content: Ao
}).passthrough(), Ro = ut.extend({
  /**
   * An optional description for the prompt.
   */
  description: c.optional(c.string()),
  messages: c.array(eu)
}), tu = xt.extend({
  method: c.literal("notifications/prompts/list_changed")
}), ru = c.object({
  /**
   * A human-readable title for the tool.
   */
  title: c.optional(c.string()),
  /**
   * If true, the tool does not modify its environment.
   *
   * Default: false
   */
  readOnlyHint: c.optional(c.boolean()),
  /**
   * If true, the tool may perform destructive updates to its environment.
   * If false, the tool performs only additive updates.
   *
   * (This property is meaningful only when `readOnlyHint == false`)
   *
   * Default: true
   */
  destructiveHint: c.optional(c.boolean()),
  /**
   * If true, calling the tool repeatedly with the same arguments
   * will have no additional effect on the its environment.
   *
   * (This property is meaningful only when `readOnlyHint == false`)
   *
   * Default: false
   */
  idempotentHint: c.optional(c.boolean()),
  /**
   * If true, this tool may interact with an "open world" of external
   * entities. If false, the tool's domain of interaction is closed.
   * For example, the world of a web search tool is open, whereas that
   * of a memory tool is not.
   *
   * Default: true
   */
  openWorldHint: c.optional(c.boolean())
}).passthrough(), au = Yr.extend({
  /**
   * A human-readable description of the tool.
   */
  description: c.optional(c.string()),
  /**
   * A JSON Schema object defining the expected parameters for the tool.
   */
  inputSchema: c.object({
    type: c.literal("object"),
    properties: c.optional(c.object({}).passthrough()),
    required: c.optional(c.array(c.string()))
  }).passthrough(),
  /**
   * An optional JSON Schema object defining the structure of the tool's output returned in
   * the structuredContent field of a CallToolResult.
   */
  outputSchema: c.optional(c.object({
    type: c.literal("object"),
    properties: c.optional(c.object({}).passthrough()),
    required: c.optional(c.array(c.string()))
  }).passthrough()),
  /**
   * Optional additional tool information.
   */
  annotations: c.optional(ru),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).merge(Kr), su = Ca.extend({
  method: c.literal("tools/list")
}), To = xa.extend({
  tools: c.array(au)
}), gn = ut.extend({
  /**
   * A list of content objects that represent the result of the tool call.
   *
   * If the Tool does not define an outputSchema, this field MUST be present in the result.
   * For backwards compatibility, this field is always present, but it may be empty.
   */
  content: c.array(Ao).default([]),
  /**
   * An object containing structured tool output.
   *
   * If the Tool defines an outputSchema, this field MUST be present in the result, and contain a JSON object that matches the schema.
   */
  structuredContent: c.object({}).passthrough().optional(),
  /**
   * Whether the tool call ended in an error.
   *
   * If not set, this is assumed to be false (the call was successful).
   *
   * Any errors that originate from the tool SHOULD be reported inside the result
   * object, with `isError` set to true, _not_ as an MCP protocol-level error
   * response. Otherwise, the LLM would not be able to see that an error occurred
   * and self-correct.
   *
   * However, any errors in _finding_ the tool, an error indicating that the
   * server does not support tool calls, or any other exceptional conditions,
   * should be reported as an MCP error response.
   */
  isError: c.optional(c.boolean())
});
gn.or(ut.extend({
  toolResult: c.unknown()
}));
const nu = rt.extend({
  method: c.literal("tools/call"),
  params: lt.extend({
    name: c.string(),
    arguments: c.optional(c.record(c.unknown()))
  })
}), iu = xt.extend({
  method: c.literal("notifications/tools/list_changed")
}), ko = c.enum(["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]), ou = rt.extend({
  method: c.literal("logging/setLevel"),
  params: lt.extend({
    /**
     * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
     */
    level: ko
  })
}), Io = xt.extend({
  method: c.literal("notifications/message"),
  params: Jr.extend({
    /**
     * The severity of this log message.
     */
    level: ko,
    /**
     * An optional name of the logger issuing this message.
     */
    logger: c.optional(c.string()),
    /**
     * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
     */
    data: c.unknown()
  })
}), cu = c.object({
  /**
   * A hint for a model name.
   */
  name: c.string().optional()
}).passthrough(), lu = c.object({
  /**
   * Optional hints to use for model selection.
   */
  hints: c.optional(c.array(cu)),
  /**
   * How much to prioritize cost when selecting a model.
   */
  costPriority: c.optional(c.number().min(0).max(1)),
  /**
   * How much to prioritize sampling speed (latency) when selecting a model.
   */
  speedPriority: c.optional(c.number().min(0).max(1)),
  /**
   * How much to prioritize intelligence and capabilities when selecting a model.
   */
  intelligencePriority: c.optional(c.number().min(0).max(1))
}).passthrough(), uu = c.object({
  role: c.enum(["user", "assistant"]),
  content: c.union([fn, pn, mn])
}).passthrough(), du = rt.extend({
  method: c.literal("sampling/createMessage"),
  params: lt.extend({
    messages: c.array(uu),
    /**
     * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
     */
    systemPrompt: c.optional(c.string()),
    /**
     * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt. The client MAY ignore this request.
     */
    includeContext: c.optional(c.enum(["none", "thisServer", "allServers"])),
    temperature: c.optional(c.number()),
    /**
     * The maximum number of tokens to sample, as requested by the server. The client MAY choose to sample fewer tokens than requested.
     */
    maxTokens: c.number().int(),
    stopSequences: c.optional(c.array(c.string())),
    /**
     * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
     */
    metadata: c.optional(c.object({}).passthrough()),
    /**
     * The server's preferences for which model to select.
     */
    modelPreferences: c.optional(lu)
  })
}), hu = ut.extend({
  /**
   * The name of the model that generated the message.
   */
  model: c.string(),
  /**
   * The reason why sampling stopped.
   */
  stopReason: c.optional(c.enum(["endTurn", "stopSequence", "maxTokens"]).or(c.string())),
  role: c.enum(["user", "assistant"]),
  content: c.discriminatedUnion("type", [fn, pn, mn])
}), fu = c.object({
  type: c.literal("boolean"),
  title: c.optional(c.string()),
  description: c.optional(c.string()),
  default: c.optional(c.boolean())
}).passthrough(), pu = c.object({
  type: c.literal("string"),
  title: c.optional(c.string()),
  description: c.optional(c.string()),
  minLength: c.optional(c.number()),
  maxLength: c.optional(c.number()),
  format: c.optional(c.enum(["email", "uri", "date", "date-time"]))
}).passthrough(), mu = c.object({
  type: c.enum(["number", "integer"]),
  title: c.optional(c.string()),
  description: c.optional(c.string()),
  minimum: c.optional(c.number()),
  maximum: c.optional(c.number())
}).passthrough(), gu = c.object({
  type: c.literal("string"),
  title: c.optional(c.string()),
  description: c.optional(c.string()),
  enum: c.array(c.string()),
  enumNames: c.optional(c.array(c.string()))
}).passthrough(), vu = c.union([fu, pu, mu, gu]), yu = rt.extend({
  method: c.literal("elicitation/create"),
  params: lt.extend({
    /**
     * The message to present to the user.
     */
    message: c.string(),
    /**
     * The schema for the requested user input.
     */
    requestedSchema: c.object({
      type: c.literal("object"),
      properties: c.record(c.string(), vu),
      required: c.optional(c.array(c.string()))
    }).passthrough()
  })
}), _u = ut.extend({
  /**
   * The user's response action.
   */
  action: c.enum(["accept", "decline", "cancel"]),
  /**
   * The collected user input content (only present if action is "accept").
   */
  content: c.optional(c.record(c.string(), c.unknown()))
}), bu = c.object({
  type: c.literal("ref/resource"),
  /**
   * The URI or URI template of the resource.
   */
  uri: c.string()
}).passthrough(), wu = c.object({
  type: c.literal("ref/prompt"),
  /**
   * The name of the prompt or prompt template
   */
  name: c.string()
}).passthrough(), Eu = rt.extend({
  method: c.literal("completion/complete"),
  params: lt.extend({
    ref: c.union([wu, bu]),
    /**
     * The argument's information
     */
    argument: c.object({
      /**
       * The name of the argument
       */
      name: c.string(),
      /**
       * The value of the argument to use for completion matching.
       */
      value: c.string()
    }).passthrough(),
    context: c.optional(c.object({
      /**
       * Previously-resolved variables in a URI template or prompt.
       */
      arguments: c.optional(c.record(c.string(), c.string()))
    }))
  })
}), $o = ut.extend({
  completion: c.object({
    /**
     * An array of completion values. Must not exceed 100 items.
     */
    values: c.array(c.string()).max(100),
    /**
     * The total number of completion options available. This can exceed the number of values actually sent in the response.
     */
    total: c.optional(c.number().int()),
    /**
     * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
     */
    hasMore: c.optional(c.boolean())
  }).passthrough()
}), Su = c.object({
  /**
   * The URI identifying the root. This *must* start with file:// for now.
   */
  uri: c.string().startsWith("file://"),
  /**
   * An optional name for the root.
   */
  name: c.optional(c.string()),
  /**
   * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
   * for notes on _meta usage.
   */
  _meta: c.optional(c.object({}).passthrough())
}).passthrough(), Pu = rt.extend({
  method: c.literal("roots/list")
}), Cu = ut.extend({
  roots: c.array(Su)
}), xu = xt.extend({
  method: c.literal("notifications/roots/list_changed")
});
c.union([
  un,
  Nl,
  Eu,
  ou,
  Kl,
  Jl,
  ql,
  zl,
  Vl,
  Bl,
  Zl,
  nu,
  su
]);
c.union([
  ln,
  dn,
  yo,
  xu
]);
c.union([ur, hu, _u, Cu]);
c.union([un, du, yu, Pu]);
c.union([
  ln,
  dn,
  Io,
  Wl,
  Hl,
  iu,
  tu
]);
c.union([
  ur,
  vo,
  $o,
  Ro,
  xo,
  So,
  Po,
  Co,
  gn,
  To
]);
class jt extends Error {
  constructor(e, r, a) {
    super(`MCP error ${e}: ${r}`), this.code = e, this.data = a, this.name = "McpError";
  }
}
const Au = 6e4;
class Ru {
  constructor(e) {
    this._options = e, this._requestMessageId = 0, this._requestHandlers = /* @__PURE__ */ new Map(), this._requestHandlerAbortControllers = /* @__PURE__ */ new Map(), this._notificationHandlers = /* @__PURE__ */ new Map(), this._responseHandlers = /* @__PURE__ */ new Map(), this._progressHandlers = /* @__PURE__ */ new Map(), this._timeoutInfo = /* @__PURE__ */ new Map(), this._pendingDebouncedNotifications = /* @__PURE__ */ new Set(), this.setNotificationHandler(ln, (r) => {
      const a = this._requestHandlerAbortControllers.get(r.params.requestId);
      a == null || a.abort(r.params.reason);
    }), this.setNotificationHandler(dn, (r) => {
      this._onprogress(r);
    }), this.setRequestHandler(
      un,
      // Automatic pong by default.
      (r) => ({})
    );
  }
  _setupTimeout(e, r, a, t, n = !1) {
    this._timeoutInfo.set(e, {
      timeoutId: setTimeout(t, r),
      startTime: Date.now(),
      timeout: r,
      maxTotalTimeout: a,
      resetTimeoutOnProgress: n,
      onTimeout: t
    });
  }
  _resetTimeout(e) {
    const r = this._timeoutInfo.get(e);
    if (!r)
      return !1;
    const a = Date.now() - r.startTime;
    if (r.maxTotalTimeout && a >= r.maxTotalTimeout)
      throw this._timeoutInfo.delete(e), new jt(wt.RequestTimeout, "Maximum total timeout exceeded", {
        maxTotalTimeout: r.maxTotalTimeout,
        totalElapsed: a
      });
    return clearTimeout(r.timeoutId), r.timeoutId = setTimeout(r.onTimeout, r.timeout), !0;
  }
  _cleanupTimeout(e) {
    const r = this._timeoutInfo.get(e);
    r && (clearTimeout(r.timeoutId), this._timeoutInfo.delete(e));
  }
  /**
   * Attaches to the given transport, starts it, and starts listening for messages.
   *
   * The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
   */
  async connect(e) {
    var r, a, t;
    this._transport = e;
    const n = (r = this.transport) === null || r === void 0 ? void 0 : r.onclose;
    this._transport.onclose = () => {
      n == null || n(), this._onclose();
    };
    const o = (a = this.transport) === null || a === void 0 ? void 0 : a.onerror;
    this._transport.onerror = (u) => {
      o == null || o(u), this._onerror(u);
    };
    const i = (t = this._transport) === null || t === void 0 ? void 0 : t.onmessage;
    this._transport.onmessage = (u, l) => {
      i == null || i(u, l), Ds(u) || Ol(u) ? this._onresponse(u) : ho(u) ? this._onrequest(u, l) : $l(u) ? this._onnotification(u) : this._onerror(new Error(`Unknown message type: ${JSON.stringify(u)}`));
    }, await this._transport.start();
  }
  _onclose() {
    var e;
    const r = this._responseHandlers;
    this._responseHandlers = /* @__PURE__ */ new Map(), this._progressHandlers.clear(), this._pendingDebouncedNotifications.clear(), this._transport = void 0, (e = this.onclose) === null || e === void 0 || e.call(this);
    const a = new jt(wt.ConnectionClosed, "Connection closed");
    for (const t of r.values())
      t(a);
  }
  _onerror(e) {
    var r;
    (r = this.onerror) === null || r === void 0 || r.call(this, e);
  }
  _onnotification(e) {
    var r;
    const a = (r = this._notificationHandlers.get(e.method)) !== null && r !== void 0 ? r : this.fallbackNotificationHandler;
    a !== void 0 && Promise.resolve().then(() => a(e)).catch((t) => this._onerror(new Error(`Uncaught error in notification handler: ${t}`)));
  }
  _onrequest(e, r) {
    var a, t;
    const n = (a = this._requestHandlers.get(e.method)) !== null && a !== void 0 ? a : this.fallbackRequestHandler, o = this._transport;
    if (n === void 0) {
      o == null || o.send({
        jsonrpc: "2.0",
        id: e.id,
        error: {
          code: wt.MethodNotFound,
          message: "Method not found"
        }
      }).catch((l) => this._onerror(new Error(`Failed to send an error response: ${l}`)));
      return;
    }
    const i = new AbortController();
    this._requestHandlerAbortControllers.set(e.id, i);
    const u = {
      signal: i.signal,
      sessionId: o == null ? void 0 : o.sessionId,
      _meta: (t = e.params) === null || t === void 0 ? void 0 : t._meta,
      sendNotification: (l) => this.notification(l, { relatedRequestId: e.id }),
      sendRequest: (l, h, f) => this.request(l, h, { ...f, relatedRequestId: e.id }),
      authInfo: r == null ? void 0 : r.authInfo,
      requestId: e.id,
      requestInfo: r == null ? void 0 : r.requestInfo
    };
    Promise.resolve().then(() => n(e, u)).then((l) => {
      if (!i.signal.aborted)
        return o == null ? void 0 : o.send({
          result: l,
          jsonrpc: "2.0",
          id: e.id
        });
    }, (l) => {
      var h;
      if (!i.signal.aborted)
        return o == null ? void 0 : o.send({
          jsonrpc: "2.0",
          id: e.id,
          error: {
            code: Number.isSafeInteger(l.code) ? l.code : wt.InternalError,
            message: (h = l.message) !== null && h !== void 0 ? h : "Internal error"
          }
        });
    }).catch((l) => this._onerror(new Error(`Failed to send response: ${l}`))).finally(() => {
      this._requestHandlerAbortControllers.delete(e.id);
    });
  }
  _onprogress(e) {
    const { progressToken: r, ...a } = e.params, t = Number(r), n = this._progressHandlers.get(t);
    if (!n) {
      this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(e)}`));
      return;
    }
    const o = this._responseHandlers.get(t), i = this._timeoutInfo.get(t);
    if (i && o && i.resetTimeoutOnProgress)
      try {
        this._resetTimeout(t);
      } catch (u) {
        o(u);
        return;
      }
    n(a);
  }
  _onresponse(e) {
    const r = Number(e.id), a = this._responseHandlers.get(r);
    if (a === void 0) {
      this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(e)}`));
      return;
    }
    if (this._responseHandlers.delete(r), this._progressHandlers.delete(r), this._cleanupTimeout(r), Ds(e))
      a(e);
    else {
      const t = new jt(e.error.code, e.error.message, e.error.data);
      a(t);
    }
  }
  get transport() {
    return this._transport;
  }
  /**
   * Closes the connection.
   */
  async close() {
    var e;
    await ((e = this._transport) === null || e === void 0 ? void 0 : e.close());
  }
  /**
   * Sends a request and wait for a response.
   *
   * Do not use this method to emit notifications! Use notification() instead.
   */
  request(e, r, a) {
    const { relatedRequestId: t, resumptionToken: n, onresumptiontoken: o } = a ?? {};
    return new Promise((i, u) => {
      var l, h, f, p, d, g;
      if (!this._transport) {
        u(new Error("Not connected"));
        return;
      }
      ((l = this._options) === null || l === void 0 ? void 0 : l.enforceStrictCapabilities) === !0 && this.assertCapabilityForMethod(e.method), (h = a == null ? void 0 : a.signal) === null || h === void 0 || h.throwIfAborted();
      const v = this._requestMessageId++, y = {
        ...e,
        jsonrpc: "2.0",
        id: v
      };
      a != null && a.onprogress && (this._progressHandlers.set(v, a.onprogress), y.params = {
        ...e.params,
        _meta: {
          ...((f = e.params) === null || f === void 0 ? void 0 : f._meta) || {},
          progressToken: v
        }
      });
      const _ = (S) => {
        var x;
        this._responseHandlers.delete(v), this._progressHandlers.delete(v), this._cleanupTimeout(v), (x = this._transport) === null || x === void 0 || x.send({
          jsonrpc: "2.0",
          method: "notifications/cancelled",
          params: {
            requestId: v,
            reason: String(S)
          }
        }, { relatedRequestId: t, resumptionToken: n, onresumptiontoken: o }).catch((E) => this._onerror(new Error(`Failed to send cancellation: ${E}`))), u(S);
      };
      this._responseHandlers.set(v, (S) => {
        var x;
        if (!(!((x = a == null ? void 0 : a.signal) === null || x === void 0) && x.aborted)) {
          if (S instanceof Error)
            return u(S);
          try {
            const E = r.parse(S.result);
            i(E);
          } catch (E) {
            u(E);
          }
        }
      }), (p = a == null ? void 0 : a.signal) === null || p === void 0 || p.addEventListener("abort", () => {
        var S;
        _((S = a == null ? void 0 : a.signal) === null || S === void 0 ? void 0 : S.reason);
      });
      const D = (d = a == null ? void 0 : a.timeout) !== null && d !== void 0 ? d : Au, O = () => _(new jt(wt.RequestTimeout, "Request timed out", { timeout: D }));
      this._setupTimeout(v, D, a == null ? void 0 : a.maxTotalTimeout, O, (g = a == null ? void 0 : a.resetTimeoutOnProgress) !== null && g !== void 0 ? g : !1), this._transport.send(y, { relatedRequestId: t, resumptionToken: n, onresumptiontoken: o }).catch((S) => {
        this._cleanupTimeout(v), u(S);
      });
    });
  }
  /**
   * Emits a notification, which is a one-way message that does not expect a response.
   */
  async notification(e, r) {
    var a, t;
    if (!this._transport)
      throw new Error("Not connected");
    if (this.assertNotificationCapability(e.method), ((t = (a = this._options) === null || a === void 0 ? void 0 : a.debouncedNotificationMethods) !== null && t !== void 0 ? t : []).includes(e.method) && !e.params && !(r != null && r.relatedRequestId)) {
      if (this._pendingDebouncedNotifications.has(e.method))
        return;
      this._pendingDebouncedNotifications.add(e.method), Promise.resolve().then(() => {
        var u;
        if (this._pendingDebouncedNotifications.delete(e.method), !this._transport)
          return;
        const l = {
          ...e,
          jsonrpc: "2.0"
        };
        (u = this._transport) === null || u === void 0 || u.send(l, r).catch((h) => this._onerror(h));
      });
      return;
    }
    const i = {
      ...e,
      jsonrpc: "2.0"
    };
    await this._transport.send(i, r);
  }
  /**
   * Registers a handler to invoke when this protocol object receives a request with the given method.
   *
   * Note that this will replace any previous request handler for the same method.
   */
  setRequestHandler(e, r) {
    const a = e.shape.method.value;
    this.assertRequestHandlerCapability(a), this._requestHandlers.set(a, (t, n) => Promise.resolve(r(e.parse(t), n)));
  }
  /**
   * Removes the request handler for the given method.
   */
  removeRequestHandler(e) {
    this._requestHandlers.delete(e);
  }
  /**
   * Asserts that a request handler has not already been set for the given method, in preparation for a new one being automatically installed.
   */
  assertCanSetRequestHandler(e) {
    if (this._requestHandlers.has(e))
      throw new Error(`A request handler for ${e} already exists, which would be overridden`);
  }
  /**
   * Registers a handler to invoke when this protocol object receives a notification with the given method.
   *
   * Note that this will replace any previous notification handler for the same method.
   */
  setNotificationHandler(e, r) {
    this._notificationHandlers.set(e.shape.method.value, (a) => Promise.resolve(r(e.parse(a))));
  }
  /**
   * Removes the notification handler for the given method.
   */
  removeNotificationHandler(e) {
    this._notificationHandlers.delete(e);
  }
}
function Tu(s, e) {
  return Object.entries(e).reduce((r, [a, t]) => (t && typeof t == "object" ? r[a] = r[a] ? { ...r[a], ...t } : t : r[a] = t, r), { ...s });
}
var Rr = { exports: {} };
/** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
var ku = Rr.exports, Zn;
function Iu() {
  return Zn || (Zn = 1, function (s, e) {
    (function (r, a) {
      a(e);
    })(ku, function (r) {
      function a() {
        for (var b = arguments.length, m = Array(b), w = 0; w < b; w++)
          m[w] = arguments[w];
        if (m.length > 1) {
          m[0] = m[0].slice(0, -1);
          for (var $ = m.length - 1, I = 1; I < $; ++I)
            m[I] = m[I].slice(1, -1);
          return m[$] = m[$].slice(1), m.join("");
        } else
          return m[0];
      }
      function t(b) {
        return "(?:" + b + ")";
      }
      function n(b) {
        return b === void 0 ? "undefined" : b === null ? "null" : Object.prototype.toString.call(b).split(" ").pop().split("]").shift().toLowerCase();
      }
      function o(b) {
        return b.toUpperCase();
      }
      function i(b) {
        return b != null ? b instanceof Array ? b : typeof b.length != "number" || b.split || b.setInterval || b.call ? [b] : Array.prototype.slice.call(b) : [];
      }
      function u(b, m) {
        var w = b;
        if (m)
          for (var $ in m)
            w[$] = m[$];
        return w;
      }
      function l(b) {
        var m = "[A-Za-z]", w = "[0-9]", $ = a(w, "[A-Fa-f]"), I = t(t("%[EFef]" + $ + "%" + $ + $ + "%" + $ + $) + "|" + t("%[89A-Fa-f]" + $ + "%" + $ + $) + "|" + t("%" + $ + $)), G = "[\\:\\/\\?\\#\\[\\]\\@]", K = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", me = a(G, K), be = b ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]", Ie = b ? "[\\uE000-\\uF8FF]" : "[]", pe = a(m, w, "[\\-\\.\\_\\~]", be);
        t(m + a(m, w, "[\\+\\-\\.]") + "*"), t(t(I + "|" + a(pe, K, "[\\:]")) + "*");
        var _e = t(t("25[0-5]") + "|" + t("2[0-4]" + w) + "|" + t("1" + w + w) + "|" + t("0?[1-9]" + w) + "|0?0?" + w), $e = t(_e + "\\." + _e + "\\." + _e + "\\." + _e), ie = t($ + "{1,4}"), Ee = t(t(ie + "\\:" + ie) + "|" + $e), De = t(t(ie + "\\:") + "{6}" + Ee), Se = t("\\:\\:" + t(ie + "\\:") + "{5}" + Ee), Nt = t(t(ie) + "?\\:\\:" + t(ie + "\\:") + "{4}" + Ee), yt = t(t(t(ie + "\\:") + "{0,1}" + ie) + "?\\:\\:" + t(ie + "\\:") + "{3}" + Ee), _t = t(t(t(ie + "\\:") + "{0,2}" + ie) + "?\\:\\:" + t(ie + "\\:") + "{2}" + Ee), sr = t(t(t(ie + "\\:") + "{0,3}" + ie) + "?\\:\\:" + ie + "\\:" + Ee), Ht = t(t(t(ie + "\\:") + "{0,4}" + ie) + "?\\:\\:" + Ee), it = t(t(t(ie + "\\:") + "{0,5}" + ie) + "?\\:\\:" + ie), bt = t(t(t(ie + "\\:") + "{0,6}" + ie) + "?\\:\\:"), Bt = t([De, Se, Nt, yt, _t, sr, Ht, it, bt].join("|")), Rt = t(t(pe + "|" + I) + "+");
        t("[vV]" + $ + "+\\." + a(pe, K, "[\\:]") + "+"), t(t(I + "|" + a(pe, K)) + "*");
        var Pr = t(I + "|" + a(pe, K, "[\\:\\@]"));
        return t(t(I + "|" + a(pe, K, "[\\@]")) + "+"), t(t(Pr + "|" + a("[\\/\\?]", Ie)) + "*"), {
          NOT_SCHEME: new RegExp(a("[^]", m, w, "[\\+\\-\\.]"), "g"),
          NOT_USERINFO: new RegExp(a("[^\\%\\:]", pe, K), "g"),
          NOT_HOST: new RegExp(a("[^\\%\\[\\]\\:]", pe, K), "g"),
          NOT_PATH: new RegExp(a("[^\\%\\/\\:\\@]", pe, K), "g"),
          NOT_PATH_NOSCHEME: new RegExp(a("[^\\%\\/\\@]", pe, K), "g"),
          NOT_QUERY: new RegExp(a("[^\\%]", pe, K, "[\\:\\@\\/\\?]", Ie), "g"),
          NOT_FRAGMENT: new RegExp(a("[^\\%]", pe, K, "[\\:\\@\\/\\?]"), "g"),
          ESCAPE: new RegExp(a("[^]", pe, K), "g"),
          UNRESERVED: new RegExp(pe, "g"),
          OTHER_CHARS: new RegExp(a("[^\\%]", pe, me), "g"),
          PCT_ENCODED: new RegExp(I, "g"),
          IPV4ADDRESS: new RegExp("^(" + $e + ")$"),
          IPV6ADDRESS: new RegExp("^\\[?(" + Bt + ")" + t(t("\\%25|\\%(?!" + $ + "{2})") + "(" + Rt + ")") + "?\\]?$")
          //RFC 6874, with relaxed parsing rules
        };
      }
      var h = l(!1), f = l(!0), p = /* @__PURE__ */ function () {
        function b(m, w) {
          var $ = [], I = !0, G = !1, K = void 0;
          try {
            for (var me = m[Symbol.iterator](), be; !(I = (be = me.next()).done) && ($.push(be.value), !(w && $.length === w)); I = !0)
              ;
          } catch (Ie) {
            G = !0, K = Ie;
          } finally {
            try {
              !I && me.return && me.return();
            } finally {
              if (G) throw K;
            }
          }
          return $;
        }
        return function (m, w) {
          if (Array.isArray(m))
            return m;
          if (Symbol.iterator in Object(m))
            return b(m, w);
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        };
      }(), d = function (b) {
        if (Array.isArray(b)) {
          for (var m = 0, w = Array(b.length); m < b.length; m++) w[m] = b[m];
          return w;
        } else
          return Array.from(b);
      }, g = 2147483647, v = 36, y = 1, _ = 26, D = 38, O = 700, S = 72, x = 128, E = "-", C = /^xn--/, T = /[^\0-\x7E]/, k = /[\x2E\u3002\uFF0E\uFF61]/g, P = {
        overflow: "Overflow: input needs wider integers to process",
        "not-basic": "Illegal input >= 0x80 (not a basic code point)",
        "invalid-input": "Invalid input"
      }, R = v - y, F = Math.floor, N = String.fromCharCode;
      function j(b) {
        throw new RangeError(P[b]);
      }
      function V(b, m) {
        for (var w = [], $ = b.length; $--;)
          w[$] = m(b[$]);
        return w;
      }
      function X(b, m) {
        var w = b.split("@"), $ = "";
        w.length > 1 && ($ = w[0] + "@", b = w[1]), b = b.replace(k, ".");
        var I = b.split("."), G = V(I, m).join(".");
        return $ + G;
      }
      function J(b) {
        for (var m = [], w = 0, $ = b.length; w < $;) {
          var I = b.charCodeAt(w++);
          if (I >= 55296 && I <= 56319 && w < $) {
            var G = b.charCodeAt(w++);
            (G & 64512) == 56320 ? m.push(((I & 1023) << 10) + (G & 1023) + 65536) : (m.push(I), w--);
          } else
            m.push(I);
        }
        return m;
      }
      var Y = function (m) {
        return String.fromCodePoint.apply(String, d(m));
      }, te = function (m) {
        return m - 48 < 10 ? m - 22 : m - 65 < 26 ? m - 65 : m - 97 < 26 ? m - 97 : v;
      }, ne = function (m, w) {
        return m + 22 + 75 * (m < 26) - ((w != 0) << 5);
      }, Ze = function (m, w, $) {
        var I = 0;
        for (
          m = $ ? F(m / O) : m >> 1, m += F(m / w);
          /* no initialization */
          m > R * _ >> 1;
          I += v
        )
          m = F(m / R);
        return F(I + (R + 1) * m / (m + D));
      }, Ue = function (m) {
        var w = [], $ = m.length, I = 0, G = x, K = S, me = m.lastIndexOf(E);
        me < 0 && (me = 0);
        for (var be = 0; be < me; ++be)
          m.charCodeAt(be) >= 128 && j("not-basic"), w.push(m.charCodeAt(be));
        for (var Ie = me > 0 ? me + 1 : 0; Ie < $;) {
          for (
            var pe = I, _e = 1, $e = v;
            ;
            /* no condition */
            $e += v
          ) {
            Ie >= $ && j("invalid-input");
            var ie = te(m.charCodeAt(Ie++));
            (ie >= v || ie > F((g - I) / _e)) && j("overflow"), I += ie * _e;
            var Ee = $e <= K ? y : $e >= K + _ ? _ : $e - K;
            if (ie < Ee)
              break;
            var De = v - Ee;
            _e > F(g / De) && j("overflow"), _e *= De;
          }
          var Se = w.length + 1;
          K = Ze(I - pe, Se, pe == 0), F(I / Se) > g - G && j("overflow"), G += F(I / Se), I %= Se, w.splice(I++, 0, G);
        }
        return String.fromCodePoint.apply(String, w);
      }, je = function (m) {
        var w = [];
        m = J(m);
        var $ = m.length, I = x, G = 0, K = S, me = !0, be = !1, Ie = void 0;
        try {
          for (var pe = m[Symbol.iterator](), _e; !(me = (_e = pe.next()).done); me = !0) {
            var $e = _e.value;
            $e < 128 && w.push(N($e));
          }
        } catch (Cr) {
          be = !0, Ie = Cr;
        } finally {
          try {
            !me && pe.return && pe.return();
          } finally {
            if (be)
              throw Ie;
          }
        }
        var ie = w.length, Ee = ie;
        for (ie && w.push(E); Ee < $;) {
          var De = g, Se = !0, Nt = !1, yt = void 0;
          try {
            for (var _t = m[Symbol.iterator](), sr; !(Se = (sr = _t.next()).done); Se = !0) {
              var Ht = sr.value;
              Ht >= I && Ht < De && (De = Ht);
            }
          } catch (Cr) {
            Nt = !0, yt = Cr;
          } finally {
            try {
              !Se && _t.return && _t.return();
            } finally {
              if (Nt)
                throw yt;
            }
          }
          var it = Ee + 1;
          De - I > F((g - G) / it) && j("overflow"), G += (De - I) * it, I = De;
          var bt = !0, Bt = !1, Rt = void 0;
          try {
            for (var Pr = m[Symbol.iterator](), On; !(bt = (On = Pr.next()).done); bt = !0) {
              var Dn = On.value;
              if (Dn < I && ++G > g && j("overflow"), Dn == I) {
                for (
                  var ta = G, ra = v;
                  ;
                  /* no condition */
                  ra += v
                ) {
                  var aa = ra <= K ? y : ra >= K + _ ? _ : ra - K;
                  if (ta < aa)
                    break;
                  var Fn = ta - aa, Nn = v - aa;
                  w.push(N(ne(aa + Fn % Nn, 0))), ta = F(Fn / Nn);
                }
                w.push(N(ne(ta, 0))), K = Ze(G, it, Ee == ie), G = 0, ++Ee;
              }
            }
          } catch (Cr) {
            Bt = !0, Rt = Cr;
          } finally {
            try {
              !bt && Pr.return && Pr.return();
            } finally {
              if (Bt)
                throw Rt;
            }
          }
          ++G, ++I;
        }
        return w.join("");
      }, Te = function (m) {
        return X(m, function (w) {
          return C.test(w) ? Ue(w.slice(4).toLowerCase()) : w;
        });
      }, nt = function (m) {
        return X(m, function (w) {
          return T.test(w) ? "xn--" + je(w) : w;
        });
      }, A = {
        /**
         * A string representing the current Punycode.js version number.
         * @memberOf punycode
         * @type String
         */
        version: "2.1.0",
        /**
         * An object of methods to convert from JavaScript's internal character
         * representation (UCS-2) to Unicode code points, and back.
         * @see <https://mathiasbynens.be/notes/javascript-encoding>
         * @memberOf punycode
         * @type Object
         */
        ucs2: {
          decode: J,
          encode: Y
        },
        decode: Ue,
        encode: je,
        toASCII: nt,
        toUnicode: Te
      }, M = {};
      function Z(b) {
        var m = b.charCodeAt(0), w = void 0;
        return m < 16 ? w = "%0" + m.toString(16).toUpperCase() : m < 128 ? w = "%" + m.toString(16).toUpperCase() : m < 2048 ? w = "%" + (m >> 6 | 192).toString(16).toUpperCase() + "%" + (m & 63 | 128).toString(16).toUpperCase() : w = "%" + (m >> 12 | 224).toString(16).toUpperCase() + "%" + (m >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (m & 63 | 128).toString(16).toUpperCase(), w;
      }
      function se(b) {
        for (var m = "", w = 0, $ = b.length; w < $;) {
          var I = parseInt(b.substr(w + 1, 2), 16);
          if (I < 128)
            m += String.fromCharCode(I), w += 3;
          else if (I >= 194 && I < 224) {
            if ($ - w >= 6) {
              var G = parseInt(b.substr(w + 4, 2), 16);
              m += String.fromCharCode((I & 31) << 6 | G & 63);
            } else
              m += b.substr(w, 6);
            w += 6;
          } else if (I >= 224) {
            if ($ - w >= 9) {
              var K = parseInt(b.substr(w + 4, 2), 16), me = parseInt(b.substr(w + 7, 2), 16);
              m += String.fromCharCode((I & 15) << 12 | (K & 63) << 6 | me & 63);
            } else
              m += b.substr(w, 9);
            w += 9;
          } else
            m += b.substr(w, 3), w += 3;
        }
        return m;
      }
      function L(b, m) {
        function w($) {
          var I = se($);
          return I.match(m.UNRESERVED) ? I : $;
        }
        return b.scheme && (b.scheme = String(b.scheme).replace(m.PCT_ENCODED, w).toLowerCase().replace(m.NOT_SCHEME, "")), b.userinfo !== void 0 && (b.userinfo = String(b.userinfo).replace(m.PCT_ENCODED, w).replace(m.NOT_USERINFO, Z).replace(m.PCT_ENCODED, o)), b.host !== void 0 && (b.host = String(b.host).replace(m.PCT_ENCODED, w).toLowerCase().replace(m.NOT_HOST, Z).replace(m.PCT_ENCODED, o)), b.path !== void 0 && (b.path = String(b.path).replace(m.PCT_ENCODED, w).replace(b.scheme ? m.NOT_PATH : m.NOT_PATH_NOSCHEME, Z).replace(m.PCT_ENCODED, o)), b.query !== void 0 && (b.query = String(b.query).replace(m.PCT_ENCODED, w).replace(m.NOT_QUERY, Z).replace(m.PCT_ENCODED, o)), b.fragment !== void 0 && (b.fragment = String(b.fragment).replace(m.PCT_ENCODED, w).replace(m.NOT_FRAGMENT, Z).replace(m.PCT_ENCODED, o)), b;
      }
      function z(b) {
        return b.replace(/^0*(.*)/, "$1") || "0";
      }
      function le(b, m) {
        var w = b.match(m.IPV4ADDRESS) || [], $ = p(w, 2), I = $[1];
        return I ? I.split(".").map(z).join(".") : b;
      }
      function fe(b, m) {
        var w = b.match(m.IPV6ADDRESS) || [], $ = p(w, 3), I = $[1], G = $[2];
        if (I) {
          for (var K = I.toLowerCase().split("::").reverse(), me = p(K, 2), be = me[0], Ie = me[1], pe = Ie ? Ie.split(":").map(z) : [], _e = be.split(":").map(z), $e = m.IPV4ADDRESS.test(_e[_e.length - 1]), ie = $e ? 7 : 8, Ee = _e.length - ie, De = Array(ie), Se = 0; Se < ie; ++Se)
            De[Se] = pe[Se] || _e[Ee + Se] || "";
          $e && (De[ie - 1] = le(De[ie - 1], m));
          var Nt = De.reduce(function (it, bt, Bt) {
            if (!bt || bt === "0") {
              var Rt = it[it.length - 1];
              Rt && Rt.index + Rt.length === Bt ? Rt.length++ : it.push({ index: Bt, length: 1 });
            }
            return it;
          }, []), yt = Nt.sort(function (it, bt) {
            return bt.length - it.length;
          })[0], _t = void 0;
          if (yt && yt.length > 1) {
            var sr = De.slice(0, yt.index), Ht = De.slice(yt.index + yt.length);
            _t = sr.join(":") + "::" + Ht.join(":");
          } else
            _t = De.join(":");
          return G && (_t += "%" + G), _t;
        } else
          return b;
      }
      var de = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i, we = "".match(/(){0}/)[1] === void 0;
      function ve(b) {
        var m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, w = {}, $ = m.iri !== !1 ? f : h;
        m.reference === "suffix" && (b = (m.scheme ? m.scheme + ":" : "") + "//" + b);
        var I = b.match(de);
        if (I) {
          we ? (w.scheme = I[1], w.userinfo = I[3], w.host = I[4], w.port = parseInt(I[5], 10), w.path = I[6] || "", w.query = I[7], w.fragment = I[8], isNaN(w.port) && (w.port = I[5])) : (w.scheme = I[1] || void 0, w.userinfo = b.indexOf("@") !== -1 ? I[3] : void 0, w.host = b.indexOf("//") !== -1 ? I[4] : void 0, w.port = parseInt(I[5], 10), w.path = I[6] || "", w.query = b.indexOf("?") !== -1 ? I[7] : void 0, w.fragment = b.indexOf("#") !== -1 ? I[8] : void 0, isNaN(w.port) && (w.port = b.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? I[4] : void 0)), w.host && (w.host = fe(le(w.host, $), $)), w.scheme === void 0 && w.userinfo === void 0 && w.host === void 0 && w.port === void 0 && !w.path && w.query === void 0 ? w.reference = "same-document" : w.scheme === void 0 ? w.reference = "relative" : w.fragment === void 0 ? w.reference = "absolute" : w.reference = "uri", m.reference && m.reference !== "suffix" && m.reference !== w.reference && (w.error = w.error || "URI is not a " + m.reference + " reference.");
          var G = M[(m.scheme || w.scheme || "").toLowerCase()];
          if (!m.unicodeSupport && (!G || !G.unicodeSupport)) {
            if (w.host && (m.domainHost || G && G.domainHost))
              try {
                w.host = A.toASCII(w.host.replace($.PCT_ENCODED, se).toLowerCase());
              } catch (K) {
                w.error = w.error || "Host's domain name can not be converted to ASCII via punycode: " + K;
              }
            L(w, h);
          } else
            L(w, $);
          G && G.parse && G.parse(w, m);
        } else
          w.error = w.error || "URI can not be parsed.";
        return w;
      }
      function ye(b, m) {
        var w = m.iri !== !1 ? f : h, $ = [];
        return b.userinfo !== void 0 && ($.push(b.userinfo), $.push("@")), b.host !== void 0 && $.push(fe(le(String(b.host), w), w).replace(w.IPV6ADDRESS, function (I, G, K) {
          return "[" + G + (K ? "%25" + K : "") + "]";
        })), (typeof b.port == "number" || typeof b.port == "string") && ($.push(":"), $.push(String(b.port))), $.length ? $.join("") : void 0;
      }
      var qe = /^\.\.?\//, Ce = /^\/\.(\/|$)/, dt = /^\/\.\.(\/|$)/, We = /^\/?(?:.|\n)*?(?=\/|$)/;
      function Ae(b) {
        for (var m = []; b.length;)
          if (b.match(qe))
            b = b.replace(qe, "");
          else if (b.match(Ce))
            b = b.replace(Ce, "/");
          else if (b.match(dt))
            b = b.replace(dt, "/"), m.pop();
          else if (b === "." || b === "..")
            b = "";
          else {
            var w = b.match(We);
            if (w) {
              var $ = w[0];
              b = b.slice($.length), m.push($);
            } else
              throw new Error("Unexpected dot segment condition");
          }
        return m.join("");
      }
      function ke(b) {
        var m = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, w = m.iri ? f : h, $ = [], I = M[(m.scheme || b.scheme || "").toLowerCase()];
        if (I && I.serialize && I.serialize(b, m), b.host && !w.IPV6ADDRESS.test(b.host)) {
          if (m.domainHost || I && I.domainHost)
            try {
              b.host = m.iri ? A.toUnicode(b.host) : A.toASCII(b.host.replace(w.PCT_ENCODED, se).toLowerCase());
            } catch (me) {
              b.error = b.error || "Host's domain name can not be converted to " + (m.iri ? "Unicode" : "ASCII") + " via punycode: " + me;
            }
        }
        L(b, w), m.reference !== "suffix" && b.scheme && ($.push(b.scheme), $.push(":"));
        var G = ye(b, m);
        if (G !== void 0 && (m.reference !== "suffix" && $.push("//"), $.push(G), b.path && b.path.charAt(0) !== "/" && $.push("/")), b.path !== void 0) {
          var K = b.path;
          !m.absolutePath && (!I || !I.absolutePath) && (K = Ae(K)), G === void 0 && (K = K.replace(/^\/\//, "/%2F")), $.push(K);
        }
        return b.query !== void 0 && ($.push("?"), $.push(b.query)), b.fragment !== void 0 && ($.push("#"), $.push(b.fragment)), $.join("");
      }
      function Xe(b, m) {
        var w = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, $ = arguments[3], I = {};
        return $ || (b = ve(ke(b, w), w), m = ve(ke(m, w), w)), w = w || {}, !w.tolerant && m.scheme ? (I.scheme = m.scheme, I.userinfo = m.userinfo, I.host = m.host, I.port = m.port, I.path = Ae(m.path || ""), I.query = m.query) : (m.userinfo !== void 0 || m.host !== void 0 || m.port !== void 0 ? (I.userinfo = m.userinfo, I.host = m.host, I.port = m.port, I.path = Ae(m.path || ""), I.query = m.query) : (m.path ? (m.path.charAt(0) === "/" ? I.path = Ae(m.path) : ((b.userinfo !== void 0 || b.host !== void 0 || b.port !== void 0) && !b.path ? I.path = "/" + m.path : b.path ? I.path = b.path.slice(0, b.path.lastIndexOf("/") + 1) + m.path : I.path = m.path, I.path = Ae(I.path)), I.query = m.query) : (I.path = b.path, m.query !== void 0 ? I.query = m.query : I.query = b.query), I.userinfo = b.userinfo, I.host = b.host, I.port = b.port), I.scheme = b.scheme), I.fragment = m.fragment, I;
      }
      function ea(b, m, w) {
        var $ = u({ scheme: "null" }, w);
        return ke(Xe(ve(b, $), ve(m, $), $, !0), $);
      }
      function Ra(b, m) {
        return typeof b == "string" ? b = ke(ve(b, m), m) : n(b) === "object" && (b = ve(ke(b, m), m)), b;
      }
      function Ta(b, m, w) {
        return typeof b == "string" ? b = ke(ve(b, w), w) : n(b) === "object" && (b = ke(b, w)), typeof m == "string" ? m = ke(ve(m, w), w) : n(m) === "object" && (m = ke(m, w)), b === m;
      }
      function Yo(b, m) {
        return b && b.toString().replace(!m || !m.iri ? h.ESCAPE : f.ESCAPE, Z);
      }
      function At(b, m) {
        return b && b.toString().replace(!m || !m.iri ? h.PCT_ENCODED : f.PCT_ENCODED, se);
      }
      var Er = {
        scheme: "http",
        domainHost: !0,
        parse: function (m, w) {
          return m.host || (m.error = m.error || "HTTP URIs must have a host."), m;
        },
        serialize: function (m, w) {
          var $ = String(m.scheme).toLowerCase() === "https";
          return (m.port === ($ ? 443 : 80) || m.port === "") && (m.port = void 0), m.path || (m.path = "/"), m;
        }
      }, Cn = {
        scheme: "https",
        domainHost: Er.domainHost,
        parse: Er.parse,
        serialize: Er.serialize
      };
      function xn(b) {
        return typeof b.secure == "boolean" ? b.secure : String(b.scheme).toLowerCase() === "wss";
      }
      var Sr = {
        scheme: "ws",
        domainHost: !0,
        parse: function (m, w) {
          var $ = m;
          return $.secure = xn($), $.resourceName = ($.path || "/") + ($.query ? "?" + $.query : ""), $.path = void 0, $.query = void 0, $;
        },
        serialize: function (m, w) {
          if ((m.port === (xn(m) ? 443 : 80) || m.port === "") && (m.port = void 0), typeof m.secure == "boolean" && (m.scheme = m.secure ? "wss" : "ws", m.secure = void 0), m.resourceName) {
            var $ = m.resourceName.split("?"), I = p($, 2), G = I[0], K = I[1];
            m.path = G && G !== "/" ? G : void 0, m.query = K, m.resourceName = void 0;
          }
          return m.fragment = void 0, m;
        }
      }, An = {
        scheme: "wss",
        domainHost: Sr.domainHost,
        parse: Sr.parse,
        serialize: Sr.serialize
      }, Xo = {}, Rn = "[A-Za-z0-9\\-\\.\\_\\~\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]", vt = "[0-9A-Fa-f]", ec = t(t("%[EFef]" + vt + "%" + vt + vt + "%" + vt + vt) + "|" + t("%[89A-Fa-f]" + vt + "%" + vt + vt) + "|" + t("%" + vt + vt)), tc = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]", rc = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]", ac = a(rc, '[\\"\\\\]'), sc = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]", nc = new RegExp(Rn, "g"), ar = new RegExp(ec, "g"), ic = new RegExp(a("[^]", tc, "[\\.]", '[\\"]', ac), "g"), Tn = new RegExp(a("[^]", Rn, sc), "g"), oc = Tn;
      function ka(b) {
        var m = se(b);
        return m.match(nc) ? m : b;
      }
      var kn = {
        scheme: "mailto",
        parse: function (m, w) {
          var $ = m, I = $.to = $.path ? $.path.split(",") : [];
          if ($.path = void 0, $.query) {
            for (var G = !1, K = {}, me = $.query.split("&"), be = 0, Ie = me.length; be < Ie; ++be) {
              var pe = me[be].split("=");
              switch (pe[0]) {
                case "to":
                  for (var _e = pe[1].split(","), $e = 0, ie = _e.length; $e < ie; ++$e)
                    I.push(_e[$e]);
                  break;
                case "subject":
                  $.subject = At(pe[1], w);
                  break;
                case "body":
                  $.body = At(pe[1], w);
                  break;
                default:
                  G = !0, K[At(pe[0], w)] = At(pe[1], w);
                  break;
              }
            }
            G && ($.headers = K);
          }
          $.query = void 0;
          for (var Ee = 0, De = I.length; Ee < De; ++Ee) {
            var Se = I[Ee].split("@");
            if (Se[0] = At(Se[0]), w.unicodeSupport)
              Se[1] = At(Se[1], w).toLowerCase();
            else
              try {
                Se[1] = A.toASCII(At(Se[1], w).toLowerCase());
              } catch (Nt) {
                $.error = $.error || "Email address's domain name can not be converted to ASCII via punycode: " + Nt;
              }
            I[Ee] = Se.join("@");
          }
          return $;
        },
        serialize: function (m, w) {
          var $ = m, I = i(m.to);
          if (I) {
            for (var G = 0, K = I.length; G < K; ++G) {
              var me = String(I[G]), be = me.lastIndexOf("@"), Ie = me.slice(0, be).replace(ar, ka).replace(ar, o).replace(ic, Z), pe = me.slice(be + 1);
              try {
                pe = w.iri ? A.toUnicode(pe) : A.toASCII(At(pe, w).toLowerCase());
              } catch (Ee) {
                $.error = $.error || "Email address's domain name can not be converted to " + (w.iri ? "Unicode" : "ASCII") + " via punycode: " + Ee;
              }
              I[G] = Ie + "@" + pe;
            }
            $.path = I.join(",");
          }
          var _e = m.headers = m.headers || {};
          m.subject && (_e.subject = m.subject), m.body && (_e.body = m.body);
          var $e = [];
          for (var ie in _e)
            _e[ie] !== Xo[ie] && $e.push(ie.replace(ar, ka).replace(ar, o).replace(Tn, Z) + "=" + _e[ie].replace(ar, ka).replace(ar, o).replace(oc, Z));
          return $e.length && ($.query = $e.join("&")), $;
        }
      }, cc = /^([^\:]+)\:(.*)/, In = {
        scheme: "urn",
        parse: function (m, w) {
          var $ = m.path && m.path.match(cc), I = m;
          if ($) {
            var G = w.scheme || I.scheme || "urn", K = $[1].toLowerCase(), me = $[2], be = G + ":" + (w.nid || K), Ie = M[be];
            I.nid = K, I.nss = me, I.path = void 0, Ie && (I = Ie.parse(I, w));
          } else
            I.error = I.error || "URN can not be parsed.";
          return I;
        },
        serialize: function (m, w) {
          var $ = w.scheme || m.scheme || "urn", I = m.nid, G = $ + ":" + (w.nid || I), K = M[G];
          K && (m = K.serialize(m, w));
          var me = m, be = m.nss;
          return me.path = (I || w.nid) + ":" + be, me;
        }
      }, lc = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/, $n = {
        scheme: "urn:uuid",
        parse: function (m, w) {
          var $ = m;
          return $.uuid = $.nss, $.nss = void 0, !w.tolerant && (!$.uuid || !$.uuid.match(lc)) && ($.error = $.error || "UUID is not valid."), $;
        },
        serialize: function (m, w) {
          var $ = m;
          return $.nss = (m.uuid || "").toLowerCase(), $;
        }
      };
      M[Er.scheme] = Er, M[Cn.scheme] = Cn, M[Sr.scheme] = Sr, M[An.scheme] = An, M[kn.scheme] = kn, M[In.scheme] = In, M[$n.scheme] = $n, r.SCHEMES = M, r.pctEncChar = Z, r.pctDecChars = se, r.parse = ve, r.removeDotSegments = Ae, r.serialize = ke, r.resolveComponents = Xe, r.resolve = ea, r.normalize = Ra, r.equal = Ta, r.escapeComponent = Yo, r.unescapeComponent = At, Object.defineProperty(r, "__esModule", { value: !0 });
    });
  }(Rr, Rr.exports)), Rr.exports;
}
var Da, Wn;
function vn() {
  return Wn || (Wn = 1, Da = function s(e, r) {
    if (e === r) return !0;
    if (e && r && typeof e == "object" && typeof r == "object") {
      if (e.constructor !== r.constructor) return !1;
      var a, t, n;
      if (Array.isArray(e)) {
        if (a = e.length, a != r.length) return !1;
        for (t = a; t-- !== 0;)
          if (!s(e[t], r[t])) return !1;
        return !0;
      }
      if (e.constructor === RegExp) return e.source === r.source && e.flags === r.flags;
      if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === r.valueOf();
      if (e.toString !== Object.prototype.toString) return e.toString() === r.toString();
      if (n = Object.keys(e), a = n.length, a !== Object.keys(r).length) return !1;
      for (t = a; t-- !== 0;)
        if (!Object.prototype.hasOwnProperty.call(r, n[t])) return !1;
      for (t = a; t-- !== 0;) {
        var o = n[t];
        if (!s(e[o], r[o])) return !1;
      }
      return !0;
    }
    return e !== e && r !== r;
  }), Da;
}
var Fa, Qn;
function $u() {
  return Qn || (Qn = 1, Fa = function (e) {
    for (var r = 0, a = e.length, t = 0, n; t < a;)
      r++, n = e.charCodeAt(t++), n >= 55296 && n <= 56319 && t < a && (n = e.charCodeAt(t), (n & 64512) == 56320 && t++);
    return r;
  }), Fa;
}
var Na, Gn;
function wr() {
  if (Gn) return Na;
  Gn = 1, Na = {
    copy: s,
    checkDataType: e,
    checkDataTypes: r,
    coerceToTypes: t,
    toHash: n,
    getProperty: u,
    escapeQuotes: l,
    equal: vn(),
    ucs2length: $u(),
    varOccurences: h,
    varReplace: f,
    schemaHasRules: p,
    schemaHasRulesExcept: d,
    schemaUnknownRules: g,
    toQuotedString: v,
    getPathExpr: y,
    getPath: _,
    getData: S,
    unescapeFragment: E,
    unescapeJsonPointer: k,
    escapeFragment: C,
    escapeJsonPointer: T
  };
  function s(P, R) {
    R = R || {};
    for (var F in P) R[F] = P[F];
    return R;
  }
  function e(P, R, F, N) {
    var j = N ? " !== " : " === ", V = N ? " || " : " && ", X = N ? "!" : "", J = N ? "" : "!";
    switch (P) {
      case "null":
        return R + j + "null";
      case "array":
        return X + "Array.isArray(" + R + ")";
      case "object":
        return "(" + X + R + V + "typeof " + R + j + '"object"' + V + J + "Array.isArray(" + R + "))";
      case "integer":
        return "(typeof " + R + j + '"number"' + V + J + "(" + R + " % 1)" + V + R + j + R + (F ? V + X + "isFinite(" + R + ")" : "") + ")";
      case "number":
        return "(typeof " + R + j + '"' + P + '"' + (F ? V + X + "isFinite(" + R + ")" : "") + ")";
      default:
        return "typeof " + R + j + '"' + P + '"';
    }
  }
  function r(P, R, F) {
    switch (P.length) {
      case 1:
        return e(P[0], R, F, !0);
      default:
        var N = "", j = n(P);
        j.array && j.object && (N = j.null ? "(" : "(!" + R + " || ", N += "typeof " + R + ' !== "object")', delete j.null, delete j.array, delete j.object), j.number && delete j.integer;
        for (var V in j)
          N += (N ? " && " : "") + e(V, R, F, !0);
        return N;
    }
  }
  var a = n(["string", "number", "integer", "boolean", "null"]);
  function t(P, R) {
    if (Array.isArray(R)) {
      for (var F = [], N = 0; N < R.length; N++) {
        var j = R[N];
        (a[j] || P === "array" && j === "array") && (F[F.length] = j);
      }
      if (F.length) return F;
    } else {
      if (a[R])
        return [R];
      if (P === "array" && R === "array")
        return ["array"];
    }
  }
  function n(P) {
    for (var R = {}, F = 0; F < P.length; F++) R[P[F]] = !0;
    return R;
  }
  var o = /^[a-z$_][a-z$_0-9]*$/i, i = /'|\\/g;
  function u(P) {
    return typeof P == "number" ? "[" + P + "]" : o.test(P) ? "." + P : "['" + l(P) + "']";
  }
  function l(P) {
    return P.replace(i, "\\$&").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\f/g, "\\f").replace(/\t/g, "\\t");
  }
  function h(P, R) {
    R += "[^0-9]";
    var F = P.match(new RegExp(R, "g"));
    return F ? F.length : 0;
  }
  function f(P, R, F) {
    return R += "([^0-9])", F = F.replace(/\$/g, "$$$$"), P.replace(new RegExp(R, "g"), F + "$1");
  }
  function p(P, R) {
    if (typeof P == "boolean") return !P;
    for (var F in P) if (R[F]) return !0;
  }
  function d(P, R, F) {
    if (typeof P == "boolean") return !P && F != "not";
    for (var N in P) if (N != F && R[N]) return !0;
  }
  function g(P, R) {
    if (typeof P != "boolean") {
      for (var F in P) if (!R[F]) return F;
    }
  }
  function v(P) {
    return "'" + l(P) + "'";
  }
  function y(P, R, F, N) {
    var j = F ? "'/' + " + R + (N ? "" : ".replace(/~/g, '~0').replace(/\\//g, '~1')") : N ? "'[' + " + R + " + ']'" : "'[\\'' + " + R + " + '\\']'";
    return x(P, j);
  }
  function _(P, R, F) {
    var N = v(F ? "/" + T(R) : u(R));
    return x(P, N);
  }
  var D = /^\/(?:[^~]|~0|~1)*$/, O = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function S(P, R, F) {
    var N, j, V, X;
    if (P === "") return "rootData";
    if (P[0] == "/") {
      if (!D.test(P)) throw new Error("Invalid JSON-pointer: " + P);
      j = P, V = "rootData";
    } else {
      if (X = P.match(O), !X) throw new Error("Invalid JSON-pointer: " + P);
      if (N = +X[1], j = X[2], j == "#") {
        if (N >= R) throw new Error("Cannot access property/index " + N + " levels up, current level is " + R);
        return F[R - N];
      }
      if (N > R) throw new Error("Cannot access data " + N + " levels up, current level is " + R);
      if (V = "data" + (R - N || ""), !j) return V;
    }
    for (var J = V, Y = j.split("/"), te = 0; te < Y.length; te++) {
      var ne = Y[te];
      ne && (V += u(k(ne)), J += " && " + V);
    }
    return J;
  }
  function x(P, R) {
    return P == '""' ? R : (P + " + " + R).replace(/([^\\])' \+ '/g, "$1");
  }
  function E(P) {
    return k(decodeURIComponent(P));
  }
  function C(P) {
    return encodeURIComponent(T(P));
  }
  function T(P) {
    return P.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  function k(P) {
    return P.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  return Na;
}
var Ma, Jn;
function Oo() {
  if (Jn) return Ma;
  Jn = 1;
  var s = wr();
  Ma = e;
  function e(r) {
    s.copy(r, this);
  }
  return Ma;
}
var ja = { exports: {} }, Kn;
function Ou() {
  if (Kn) return ja.exports;
  Kn = 1;
  var s = ja.exports = function (a, t, n) {
    typeof t == "function" && (n = t, t = {}), n = t.cb || n;
    var o = typeof n == "function" ? n : n.pre || function () {
    }, i = n.post || function () {
    };
    e(t, o, i, a, "", a);
  };
  s.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0
  }, s.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, s.propsKeywords = {
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, s.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function e(a, t, n, o, i, u, l, h, f, p) {
    if (o && typeof o == "object" && !Array.isArray(o)) {
      t(o, i, u, l, h, f, p);
      for (var d in o) {
        var g = o[d];
        if (Array.isArray(g)) {
          if (d in s.arrayKeywords)
            for (var v = 0; v < g.length; v++)
              e(a, t, n, g[v], i + "/" + d + "/" + v, u, i, d, o, v);
        } else if (d in s.propsKeywords) {
          if (g && typeof g == "object")
            for (var y in g)
              e(a, t, n, g[y], i + "/" + d + "/" + r(y), u, i, d, o, y);
        } else (d in s.keywords || a.allKeys && !(d in s.skipKeywords)) && e(a, t, n, g, i + "/" + d, u, i, d, o);
      }
      n(o, i, u, l, h, f, p);
    }
  }
  function r(a) {
    return a.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return ja.exports;
}
var La, Yn;
function yn() {
  if (Yn) return La;
  Yn = 1;
  var s = Iu(), e = vn(), r = wr(), a = Oo(), t = Ou();
  La = n, n.normalizeId = _, n.fullPath = g, n.url = D, n.ids = O, n.inlineRef = f, n.schema = o;
  function n(S, x, E) {
    var C = this._refs[E];
    if (typeof C == "string")
      if (this._refs[C]) C = this._refs[C];
      else return n.call(this, S, x, C);
    if (C = C || this._schemas[E], C instanceof a)
      return f(C.schema, this._opts.inlineRefs) ? C.schema : C.validate || this._compile(C);
    var T = o.call(this, x, E), k, P, R;
    return T && (k = T.schema, x = T.root, R = T.baseId), k instanceof a ? P = k.validate || S.call(this, k.schema, x, void 0, R) : k !== void 0 && (P = f(k, this._opts.inlineRefs) ? k : S.call(this, k, x, void 0, R)), P;
  }
  function o(S, x) {
    var E = s.parse(x), C = v(E), T = g(this._getId(S.schema));
    if (Object.keys(S.schema).length === 0 || C !== T) {
      var k = _(C), P = this._refs[k];
      if (typeof P == "string")
        return i.call(this, S, P, E);
      if (P instanceof a)
        P.validate || this._compile(P), S = P;
      else if (P = this._schemas[k], P instanceof a) {
        if (P.validate || this._compile(P), k == _(x))
          return { schema: P, root: S, baseId: T };
        S = P;
      } else
        return;
      if (!S.schema) return;
      T = g(this._getId(S.schema));
    }
    return l.call(this, E, T, S.schema, S);
  }
  function i(S, x, E) {
    var C = o.call(this, S, x);
    if (C) {
      var T = C.schema, k = C.baseId;
      S = C.root;
      var P = this._getId(T);
      return P && (k = D(k, P)), l.call(this, E, k, T, S);
    }
  }
  var u = r.toHash(["properties", "patternProperties", "enum", "dependencies", "definitions"]);
  function l(S, x, E, C) {
    if (S.fragment = S.fragment || "", S.fragment.slice(0, 1) == "/") {
      for (var T = S.fragment.split("/"), k = 1; k < T.length; k++) {
        var P = T[k];
        if (P) {
          if (P = r.unescapeFragment(P), E = E[P], E === void 0) break;
          var R;
          if (!u[P] && (R = this._getId(E), R && (x = D(x, R)), E.$ref)) {
            var F = D(x, E.$ref), N = o.call(this, C, F);
            N && (E = N.schema, C = N.root, x = N.baseId);
          }
        }
      }
      if (E !== void 0 && E !== C.schema)
        return { schema: E, root: C, baseId: x };
    }
  }
  var h = r.toHash([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum"
  ]);
  function f(S, x) {
    if (x === !1) return !1;
    if (x === void 0 || x === !0) return p(S);
    if (x) return d(S) <= x;
  }
  function p(S) {
    var x;
    if (Array.isArray(S)) {
      for (var E = 0; E < S.length; E++)
        if (x = S[E], typeof x == "object" && !p(x)) return !1;
    } else
      for (var C in S)
        if (C == "$ref" || (x = S[C], typeof x == "object" && !p(x))) return !1;
    return !0;
  }
  function d(S) {
    var x = 0, E;
    if (Array.isArray(S)) {
      for (var C = 0; C < S.length; C++)
        if (E = S[C], typeof E == "object" && (x += d(E)), x == 1 / 0) return 1 / 0;
    } else
      for (var T in S) {
        if (T == "$ref") return 1 / 0;
        if (h[T])
          x++;
        else if (E = S[T], typeof E == "object" && (x += d(E) + 1), x == 1 / 0) return 1 / 0;
      }
    return x;
  }
  function g(S, x) {
    x !== !1 && (S = _(S));
    var E = s.parse(S);
    return v(E);
  }
  function v(S) {
    return s.serialize(S).split("#")[0] + "#";
  }
  var y = /#\/?$/;
  function _(S) {
    return S ? S.replace(y, "") : "";
  }
  function D(S, x) {
    return x = _(x), s.resolve(S, x);
  }
  function O(S) {
    var x = _(this._getId(S)), E = { "": x }, C = { "": g(x, !1) }, T = {}, k = this;
    return t(S, { allKeys: !0 }, function (P, R, F, N, j, V, X) {
      if (R !== "") {
        var J = k._getId(P), Y = E[N], te = C[N] + "/" + j;
        if (X !== void 0 && (te += "/" + (typeof X == "number" ? X : r.escapeFragment(X))), typeof J == "string") {
          J = Y = _(Y ? s.resolve(Y, J) : J);
          var ne = k._refs[J];
          if (typeof ne == "string" && (ne = k._refs[ne]), ne && ne.schema) {
            if (!e(P, ne.schema))
              throw new Error('id "' + J + '" resolves to more than one schema');
          } else if (J != _(te))
            if (J[0] == "#") {
              if (T[J] && !e(P, T[J]))
                throw new Error('id "' + J + '" resolves to more than one schema');
              T[J] = P;
            } else
              k._refs[J] = te;
        }
        E[R] = Y, C[R] = te;
      }
    }), T;
  }
  return La;
}
var Ua, Xn;
function _n() {
  if (Xn) return Ua;
  Xn = 1;
  var s = yn();
  Ua = {
    Validation: a(e),
    MissingRef: a(r)
  };
  function e(t) {
    this.message = "validation failed", this.errors = t, this.ajv = this.validation = !0;
  }
  r.message = function (t, n) {
    return "can't resolve reference " + n + " from id " + t;
  };
  function r(t, n, o) {
    this.message = o || r.message(t, n), this.missingRef = s.url(t, n), this.missingSchema = s.normalizeId(s.fullPath(this.missingRef));
  }
  function a(t) {
    return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t;
  }
  return Ua;
}
var qa, ei;
function Do() {
  return ei || (ei = 1, qa = function (s, e) {
    e || (e = {}), typeof e == "function" && (e = { cmp: e });
    var r = typeof e.cycles == "boolean" ? e.cycles : !1, a = e.cmp && /* @__PURE__ */ function (n) {
      return function (o) {
        return function (i, u) {
          var l = { key: i, value: o[i] }, h = { key: u, value: o[u] };
          return n(l, h);
        };
      };
    }(e.cmp), t = [];
    return function n(o) {
      if (o && o.toJSON && typeof o.toJSON == "function" && (o = o.toJSON()), o !== void 0) {
        if (typeof o == "number") return isFinite(o) ? "" + o : "null";
        if (typeof o != "object") return JSON.stringify(o);
        var i, u;
        if (Array.isArray(o)) {
          for (u = "[", i = 0; i < o.length; i++)
            i && (u += ","), u += n(o[i]) || "null";
          return u + "]";
        }
        if (o === null) return "null";
        if (t.indexOf(o) !== -1) {
          if (r) return JSON.stringify("__cycle__");
          throw new TypeError("Converting circular structure to JSON");
        }
        var l = t.push(o) - 1, h = Object.keys(o).sort(a && a(o));
        for (u = "", i = 0; i < h.length; i++) {
          var f = h[i], p = n(o[f]);
          p && (u && (u += ","), u += JSON.stringify(f) + ":" + p);
        }
        return t.splice(l, 1), "{" + u + "}";
      }
    }(s);
  }), qa;
}
var za, ti;
function Fo() {
  return ti || (ti = 1, za = function (e, r, a) {
    var t = "", n = e.schema.$async === !0, o = e.util.schemaHasRulesExcept(e.schema, e.RULES.all, "$ref"), i = e.self._getId(e.schema);
    if (e.opts.strictKeywords) {
      var u = e.util.schemaUnknownRules(e.schema, e.RULES.keywords);
      if (u) {
        var l = "unknown keyword: " + u;
        if (e.opts.strictKeywords === "log") e.logger.warn(l);
        else throw new Error(l);
      }
    }
    if (e.isTop && (t += " var validate = ", n && (e.async = !0, t += "async "), t += "function(data, dataPath, parentData, parentDataProperty, rootData) { 'use strict'; ", i && (e.opts.sourceCode || e.opts.processCode) && (t += " " + ("/*# sourceURL=" + i + " */") + " ")), typeof e.schema == "boolean" || !(o || e.schema.$ref)) {
      var r = "false schema", h = e.level, f = e.dataLevel, p = e.schema[r], d = e.schemaPath + e.util.getProperty(r), g = e.errSchemaPath + "/" + r, x = !e.opts.allErrors, T, v = "data" + (f || ""), S = "valid" + h;
      if (e.schema === !1) {
        e.isTop ? x = !0 : t += " var " + S + " = false; ";
        var y = y || [];
        y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (T || "false schema") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(g) + " , params: {} ", e.opts.messages !== !1 && (t += " , message: 'boolean schema is false' "), e.opts.verbose && (t += " , schema: false , parentSchema: validate.schema" + e.schemaPath + " , data: " + v + " "), t += " } ") : t += " {} ";
        var _ = t;
        t = y.pop(), !e.compositeRule && x ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      } else
        e.isTop ? n ? t += " return data; " : t += " validate.errors = null; return true; " : t += " var " + S + " = true; ";
      return e.isTop && (t += " }; return validate; "), t;
    }
    if (e.isTop) {
      var D = e.isTop, h = e.level = 0, f = e.dataLevel = 0, v = "data";
      if (e.rootId = e.resolve.fullPath(e.self._getId(e.root.schema)), e.baseId = e.baseId || e.rootId, delete e.isTop, e.dataPathArr = [""], e.schema.default !== void 0 && e.opts.useDefaults && e.opts.strictDefaults) {
        var O = "default is ignored in the schema root";
        if (e.opts.strictDefaults === "log") e.logger.warn(O);
        else throw new Error(O);
      }
      t += " var vErrors = null; ", t += " var errors = 0;     ", t += " if (rootData === undefined) rootData = data; ";
    } else {
      var h = e.level, f = e.dataLevel, v = "data" + (f || "");
      if (i && (e.baseId = e.resolve.url(e.baseId, i)), n && !e.async) throw new Error("async schema in sync schema");
      t += " var errs_" + h + " = errors;";
    }
    var S = "valid" + h, x = !e.opts.allErrors, E = "", C = "", T, k = e.schema.type, P = Array.isArray(k);
    if (k && e.opts.nullable && e.schema.nullable === !0 && (P ? k.indexOf("null") == -1 && (k = k.concat("null")) : k != "null" && (k = [k, "null"], P = !0)), P && k.length == 1 && (k = k[0], P = !1), e.schema.$ref && o) {
      if (e.opts.extendRefs == "fail")
        throw new Error('$ref: validation keywords used in schema at path "' + e.errSchemaPath + '" (see option extendRefs)');
      e.opts.extendRefs !== !0 && (o = !1, e.logger.warn('$ref: keywords ignored in schema at path "' + e.errSchemaPath + '"'));
    }
    if (e.schema.$comment && e.opts.$comment && (t += " " + e.RULES.all.$comment.code(e, "$comment")), k) {
      if (e.opts.coerceTypes)
        var R = e.util.coerceToTypes(e.opts.coerceTypes, k);
      var F = e.RULES.types[k];
      if (R || P || F === !0 || F && !Ce(F)) {
        var d = e.schemaPath + ".type", g = e.errSchemaPath + "/type", d = e.schemaPath + ".type", g = e.errSchemaPath + "/type", N = P ? "checkDataTypes" : "checkDataType";
        if (t += " if (" + e.util[N](k, v, e.opts.strictNumbers, !0) + ") { ", R) {
          var j = "dataType" + h, V = "coerced" + h;
          t += " var " + j + " = typeof " + v + "; var " + V + " = undefined; ", e.opts.coerceTypes == "array" && (t += " if (" + j + " == 'object' && Array.isArray(" + v + ") && " + v + ".length == 1) { " + v + " = " + v + "[0]; " + j + " = typeof " + v + "; if (" + e.util.checkDataType(e.schema.type, v, e.opts.strictNumbers) + ") " + V + " = " + v + "; } "), t += " if (" + V + " !== undefined) ; ";
          var X = R;
          if (X)
            for (var J, Y = -1, te = X.length - 1; Y < te;)
              J = X[Y += 1], J == "string" ? t += " else if (" + j + " == 'number' || " + j + " == 'boolean') " + V + " = '' + " + v + "; else if (" + v + " === null) " + V + " = ''; " : J == "number" || J == "integer" ? (t += " else if (" + j + " == 'boolean' || " + v + " === null || (" + j + " == 'string' && " + v + " && " + v + " == +" + v + " ", J == "integer" && (t += " && !(" + v + " % 1)"), t += ")) " + V + " = +" + v + "; ") : J == "boolean" ? t += " else if (" + v + " === 'false' || " + v + " === 0 || " + v + " === null) " + V + " = false; else if (" + v + " === 'true' || " + v + " === 1) " + V + " = true; " : J == "null" ? t += " else if (" + v + " === '' || " + v + " === 0 || " + v + " === false) " + V + " = null; " : e.opts.coerceTypes == "array" && J == "array" && (t += " else if (" + j + " == 'string' || " + j + " == 'number' || " + j + " == 'boolean' || " + v + " == null) " + V + " = [" + v + "]; ");
          t += " else {   ";
          var y = y || [];
          y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (T || "type") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(g) + " , params: { type: '", P ? t += "" + k.join(",") : t += "" + k, t += "' } ", e.opts.messages !== !1 && (t += " , message: 'should be ", P ? t += "" + k.join(",") : t += "" + k, t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + d + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + v + " "), t += " } ") : t += " {} ";
          var _ = t;
          t = y.pop(), !e.compositeRule && x ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } if (" + V + " !== undefined) {  ";
          var ne = f ? "data" + (f - 1 || "") : "parentData", Ze = f ? e.dataPathArr[f] : "parentDataProperty";
          t += " " + v + " = " + V + "; ", f || (t += "if (" + ne + " !== undefined)"), t += " " + ne + "[" + Ze + "] = " + V + "; } ";
        } else {
          var y = y || [];
          y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (T || "type") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(g) + " , params: { type: '", P ? t += "" + k.join(",") : t += "" + k, t += "' } ", e.opts.messages !== !1 && (t += " , message: 'should be ", P ? t += "" + k.join(",") : t += "" + k, t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + d + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + v + " "), t += " } ") : t += " {} ";
          var _ = t;
          t = y.pop(), !e.compositeRule && x ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        t += " } ";
      }
    }
    if (e.schema.$ref && !o)
      t += " " + e.RULES.all.$ref.code(e, "$ref") + " ", x && (t += " } if (errors === ", D ? t += "0" : t += "errs_" + h, t += ") { ", C += "}");
    else {
      var Ue = e.RULES;
      if (Ue) {
        for (var F, je = -1, Te = Ue.length - 1; je < Te;)
          if (F = Ue[je += 1], Ce(F)) {
            if (F.type && (t += " if (" + e.util.checkDataType(F.type, v, e.opts.strictNumbers) + ") { "), e.opts.useDefaults) {
              if (F.type == "object" && e.schema.properties) {
                var p = e.schema.properties, nt = Object.keys(p), A = nt;
                if (A)
                  for (var M, Z = -1, se = A.length - 1; Z < se;) {
                    M = A[Z += 1];
                    var L = p[M];
                    if (L.default !== void 0) {
                      var z = v + e.util.getProperty(M);
                      if (e.compositeRule) {
                        if (e.opts.strictDefaults) {
                          var O = "default is ignored for: " + z;
                          if (e.opts.strictDefaults === "log") e.logger.warn(O);
                          else throw new Error(O);
                        }
                      } else
                        t += " if (" + z + " === undefined ", e.opts.useDefaults == "empty" && (t += " || " + z + " === null || " + z + " === '' "), t += " ) " + z + " = ", e.opts.useDefaults == "shared" ? t += " " + e.useDefault(L.default) + " " : t += " " + JSON.stringify(L.default) + " ", t += "; ";
                    }
                  }
              } else if (F.type == "array" && Array.isArray(e.schema.items)) {
                var le = e.schema.items;
                if (le) {
                  for (var L, Y = -1, fe = le.length - 1; Y < fe;)
                    if (L = le[Y += 1], L.default !== void 0) {
                      var z = v + "[" + Y + "]";
                      if (e.compositeRule) {
                        if (e.opts.strictDefaults) {
                          var O = "default is ignored for: " + z;
                          if (e.opts.strictDefaults === "log") e.logger.warn(O);
                          else throw new Error(O);
                        }
                      } else
                        t += " if (" + z + " === undefined ", e.opts.useDefaults == "empty" && (t += " || " + z + " === null || " + z + " === '' "), t += " ) " + z + " = ", e.opts.useDefaults == "shared" ? t += " " + e.useDefault(L.default) + " " : t += " " + JSON.stringify(L.default) + " ", t += "; ";
                    }
                }
              }
            }
            var de = F.rules;
            if (de) {
              for (var we, ve = -1, ye = de.length - 1; ve < ye;)
                if (we = de[ve += 1], dt(we)) {
                  var qe = we.code(e, we.keyword, F.type);
                  qe && (t += " " + qe + " ", x && (E += "}"));
                }
            }
            if (x && (t += " " + E + " ", E = ""), F.type && (t += " } ", k && k === F.type && !R)) {
              t += " else { ";
              var d = e.schemaPath + ".type", g = e.errSchemaPath + "/type", y = y || [];
              y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (T || "type") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(g) + " , params: { type: '", P ? t += "" + k.join(",") : t += "" + k, t += "' } ", e.opts.messages !== !1 && (t += " , message: 'should be ", P ? t += "" + k.join(",") : t += "" + k, t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + d + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + v + " "), t += " } ") : t += " {} ";
              var _ = t;
              t = y.pop(), !e.compositeRule && x ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } ";
            }
            x && (t += " if (errors === ", D ? t += "0" : t += "errs_" + h, t += ") { ", C += "}");
          }
      }
    }
    x && (t += " " + C + " "), D ? (n ? (t += " if (errors === 0) return data;           ", t += " else throw new ValidationError(vErrors); ") : (t += " validate.errors = vErrors; ", t += " return errors === 0;       "), t += " }; return validate;") : t += " var " + S + " = errors === errs_" + h + ";";
    function Ce(Ae) {
      for (var ke = Ae.rules, Xe = 0; Xe < ke.length; Xe++)
        if (dt(ke[Xe])) return !0;
    }
    function dt(Ae) {
      return e.schema[Ae.keyword] !== void 0 || Ae.implements && We(Ae);
    }
    function We(Ae) {
      for (var ke = Ae.implements, Xe = 0; Xe < ke.length; Xe++)
        if (e.schema[ke[Xe]] !== void 0) return !0;
    }
    return t;
  }), za;
}
var Va, ri;
function Du() {
  if (ri) return Va;
  ri = 1;
  var s = yn(), e = wr(), r = _n(), a = Do(), t = Fo(), n = e.ucs2length, o = vn(), i = r.Validation;
  Va = u;
  function u(_, D, O, S) {
    var x = this, E = this._opts, C = [void 0], T = {}, k = [], P = {}, R = [], F = {}, N = [];
    D = D || { schema: _, refVal: C, refs: T };
    var j = l.call(this, _, D, S), V = this._compilations[j.index];
    if (j.compiling) return V.callValidate = ne;
    var X = this._formats, J = this.RULES;
    try {
      var Y = Ze(_, D, O, S);
      V.validate = Y;
      var te = V.callValidate;
      return te && (te.schema = Y.schema, te.errors = null, te.refs = Y.refs, te.refVal = Y.refVal, te.root = Y.root, te.$async = Y.$async, E.sourceCode && (te.source = Y.source)), Y;
    } finally {
      h.call(this, _, D, S);
    }
    function ne() {
      var L = V.validate, z = L.apply(this, arguments);
      return ne.errors = L.errors, z;
    }
    function Ze(L, z, le, fe) {
      var de = !z || z && z.schema == L;
      if (z.schema != D.schema)
        return u.call(x, L, z, le, fe);
      var we = L.$async === !0, ve = t({
        isTop: !0,
        schema: L,
        isRoot: de,
        baseId: fe,
        root: z,
        schemaPath: "",
        errSchemaPath: "#",
        errorPath: '""',
        MissingRefError: r.MissingRef,
        RULES: J,
        validate: t,
        util: e,
        resolve: s,
        resolveRef: Ue,
        usePattern: M,
        useDefault: Z,
        useCustomRule: se,
        opts: E,
        formats: X,
        logger: x.logger,
        self: x
      });
      ve = y(C, g) + y(k, p) + y(R, d) + y(N, v) + ve, E.processCode && (ve = E.processCode(ve, L));
      var ye;
      try {
        var qe = new Function(
          "self",
          "RULES",
          "formats",
          "root",
          "refVal",
          "defaults",
          "customRules",
          "equal",
          "ucs2length",
          "ValidationError",
          ve
        );
        ye = qe(
          x,
          J,
          X,
          D,
          C,
          R,
          N,
          o,
          n,
          i
        ), C[0] = ye;
      } catch (Ce) {
        throw x.logger.error("Error compiling schema, function code:", ve), Ce;
      }
      return ye.schema = L, ye.errors = null, ye.refs = T, ye.refVal = C, ye.root = de ? ye : z, we && (ye.$async = !0), E.sourceCode === !0 && (ye.source = {
        code: ve,
        patterns: k,
        defaults: R
      }), ye;
    }
    function Ue(L, z, le) {
      z = s.url(L, z);
      var fe = T[z], de, we;
      if (fe !== void 0)
        return de = C[fe], we = "refVal[" + fe + "]", A(de, we);
      if (!le && D.refs) {
        var ve = D.refs[z];
        if (ve !== void 0)
          return de = D.refVal[ve], we = je(z, de), A(de, we);
      }
      we = je(z);
      var ye = s.call(x, Ze, D, z);
      if (ye === void 0) {
        var qe = O && O[z];
        qe && (ye = s.inlineRef(qe, E.inlineRefs) ? qe : u.call(x, qe, D, O, L));
      }
      if (ye === void 0)
        Te(z);
      else
        return nt(z, ye), A(ye, we);
    }
    function je(L, z) {
      var le = C.length;
      return C[le] = z, T[L] = le, "refVal" + le;
    }
    function Te(L) {
      delete T[L];
    }
    function nt(L, z) {
      var le = T[L];
      C[le] = z;
    }
    function A(L, z) {
      return typeof L == "object" || typeof L == "boolean" ? { code: z, schema: L, inline: !0 } : { code: z, $async: L && !!L.$async };
    }
    function M(L) {
      var z = P[L];
      return z === void 0 && (z = P[L] = k.length, k[z] = L), "pattern" + z;
    }
    function Z(L) {
      switch (typeof L) {
        case "boolean":
        case "number":
          return "" + L;
        case "string":
          return e.toQuotedString(L);
        case "object":
          if (L === null) return "null";
          var z = a(L), le = F[z];
          return le === void 0 && (le = F[z] = R.length, R[le] = L), "default" + le;
      }
    }
    function se(L, z, le, fe) {
      if (x._opts.validateSchema !== !1) {
        var de = L.definition.dependencies;
        if (de && !de.every(function (ke) {
          return Object.prototype.hasOwnProperty.call(le, ke);
        }))
          throw new Error("parent schema must have all required keywords: " + de.join(","));
        var we = L.definition.validateSchema;
        if (we) {
          var ve = we(z);
          if (!ve) {
            var ye = "keyword schema is invalid: " + x.errorsText(we.errors);
            if (x._opts.validateSchema == "log") x.logger.error(ye);
            else throw new Error(ye);
          }
        }
      }
      var qe = L.definition.compile, Ce = L.definition.inline, dt = L.definition.macro, We;
      if (qe)
        We = qe.call(x, z, le, fe);
      else if (dt)
        We = dt.call(x, z, le, fe), E.validateSchema !== !1 && x.validateSchema(We, !0);
      else if (Ce)
        We = Ce.call(x, fe, L.keyword, z, le);
      else if (We = L.definition.validate, !We) return;
      if (We === void 0)
        throw new Error('custom keyword "' + L.keyword + '"failed to compile');
      var Ae = N.length;
      return N[Ae] = We, {
        code: "customRule" + Ae,
        validate: We
      };
    }
  }
  function l(_, D, O) {
    var S = f.call(this, _, D, O);
    return S >= 0 ? { index: S, compiling: !0 } : (S = this._compilations.length, this._compilations[S] = {
      schema: _,
      root: D,
      baseId: O
    }, { index: S, compiling: !1 });
  }
  function h(_, D, O) {
    var S = f.call(this, _, D, O);
    S >= 0 && this._compilations.splice(S, 1);
  }
  function f(_, D, O) {
    for (var S = 0; S < this._compilations.length; S++) {
      var x = this._compilations[S];
      if (x.schema == _ && x.root == D && x.baseId == O) return S;
    }
    return -1;
  }
  function p(_, D) {
    return "var pattern" + _ + " = new RegExp(" + e.toQuotedString(D[_]) + ");";
  }
  function d(_) {
    return "var default" + _ + " = defaults[" + _ + "];";
  }
  function g(_, D) {
    return D[_] === void 0 ? "" : "var refVal" + _ + " = refVal[" + _ + "];";
  }
  function v(_) {
    return "var customRule" + _ + " = customRules[" + _ + "];";
  }
  function y(_, D) {
    if (!_.length) return "";
    for (var O = "", S = 0; S < _.length; S++)
      O += D(S, _);
    return O;
  }
  return Va;
}
var Ha = { exports: {} }, ai;
function Fu() {
  if (ai) return Ha.exports;
  ai = 1;
  var s = Ha.exports = function () {
    this._cache = {};
  };
  return s.prototype.put = function (r, a) {
    this._cache[r] = a;
  }, s.prototype.get = function (r) {
    return this._cache[r];
  }, s.prototype.del = function (r) {
    delete this._cache[r];
  }, s.prototype.clear = function () {
    this._cache = {};
  }, Ha.exports;
}
var Ba, si;
function Nu() {
  if (si) return Ba;
  si = 1;
  var s = wr(), e = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, r = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], a = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i, t = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i, n = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i, o = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i, i = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i, u = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i, l = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i, h = /^(?:\/(?:[^~/]|~0|~1)*)*$/, f = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i, p = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
  Ba = d;
  function d(C) {
    return C = C == "full" ? "full" : "fast", s.copy(d[C]);
  }
  d.fast = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
    "date-time": /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    "uri-template": i,
    url: u,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
    hostname: t,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    // optimized http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
    ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
    regex: E,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: l,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": h,
    "json-pointer-uri-fragment": f,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": p
  }, d.full = {
    date: v,
    time: y,
    "date-time": D,
    uri: S,
    "uri-reference": o,
    "uri-template": i,
    url: u,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: t,
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
    regex: E,
    uuid: l,
    "json-pointer": h,
    "json-pointer-uri-fragment": f,
    "relative-json-pointer": p
  };
  function g(C) {
    return C % 4 === 0 && (C % 100 !== 0 || C % 400 === 0);
  }
  function v(C) {
    var T = C.match(e);
    if (!T) return !1;
    var k = +T[1], P = +T[2], R = +T[3];
    return P >= 1 && P <= 12 && R >= 1 && R <= (P == 2 && g(k) ? 29 : r[P]);
  }
  function y(C, T) {
    var k = C.match(a);
    if (!k) return !1;
    var P = k[1], R = k[2], F = k[3], N = k[5];
    return (P <= 23 && R <= 59 && F <= 59 || P == 23 && R == 59 && F == 60) && (!T || N);
  }
  var _ = /t|\s/i;
  function D(C) {
    var T = C.split(_);
    return T.length == 2 && v(T[0]) && y(T[1], !0);
  }
  var O = /\/|:/;
  function S(C) {
    return O.test(C) && n.test(C);
  }
  var x = /[^\\]\\Z/;
  function E(C) {
    if (x.test(C)) return !1;
    try {
      return new RegExp(C), !0;
    } catch {
      return !1;
    }
  }
  return Ba;
}
var Za, ni;
function Mu() {
  return ni || (ni = 1, Za = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.errSchemaPath + "/" + r, l = !e.opts.allErrors, h = "data" + (o || ""), f = "valid" + n, p, d;
    if (i == "#" || i == "#/")
      e.isRoot ? (p = e.async, d = "validate") : (p = e.root.schema.$async === !0, d = "root.refVal[0]");
    else {
      var g = e.resolveRef(e.baseId, i, e.isRoot);
      if (g === void 0) {
        var v = e.MissingRefError.message(e.baseId, i);
        if (e.opts.missingRefs == "fail") {
          e.logger.error(v);
          var y = y || [];
          y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '$ref' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(u) + " , params: { ref: '" + e.util.escapeQuotes(i) + "' } ", e.opts.messages !== !1 && (t += " , message: 'can\\'t resolve reference " + e.util.escapeQuotes(i) + "' "), e.opts.verbose && (t += " , schema: " + e.util.toQuotedString(i) + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + h + " "), t += " } ") : t += " {} ";
          var _ = t;
          t = y.pop(), !e.compositeRule && l ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", l && (t += " if (false) { ");
        } else if (e.opts.missingRefs == "ignore")
          e.logger.warn(v), l && (t += " if (true) { ");
        else
          throw new e.MissingRefError(e.baseId, i, v);
      } else if (g.inline) {
        var D = e.util.copy(e);
        D.level++;
        var O = "valid" + D.level;
        D.schema = g.schema, D.schemaPath = "", D.errSchemaPath = i;
        var S = e.validate(D).replace(/validate\.schema/g, g.code);
        t += " " + S + " ", l && (t += " if (" + O + ") { ");
      } else
        p = g.$async === !0 || e.async && g.$async !== !1, d = g.code;
    }
    if (d) {
      var y = y || [];
      y.push(t), t = "", e.opts.passContext ? t += " " + d + ".call(this, " : t += " " + d + "( ", t += " " + h + ", (dataPath || '')", e.errorPath != '""' && (t += " + " + e.errorPath);
      var x = o ? "data" + (o - 1 || "") : "parentData", E = o ? e.dataPathArr[o] : "parentDataProperty";
      t += " , " + x + " , " + E + ", rootData)  ";
      var C = t;
      if (t = y.pop(), p) {
        if (!e.async) throw new Error("async schema referenced by sync schema");
        l && (t += " var " + f + "; "), t += " try { await " + C + "; ", l && (t += " " + f + " = true; "), t += " } catch (e) { if (!(e instanceof ValidationError)) throw e; if (vErrors === null) vErrors = e.errors; else vErrors = vErrors.concat(e.errors); errors = vErrors.length; ", l && (t += " " + f + " = false; "), t += " } ", l && (t += " if (" + f + ") { ");
      } else
        t += " if (!" + C + ") { if (vErrors === null) vErrors = " + d + ".errors; else vErrors = vErrors.concat(" + d + ".errors); errors = vErrors.length; } ", l && (t += " else { ");
    }
    return t;
  }), Za;
}
var Wa, ii;
function ju() {
  return ii || (ii = 1, Wa = function (e, r, a) {
    var t = " ", n = e.schema[r], o = e.schemaPath + e.util.getProperty(r), i = e.errSchemaPath + "/" + r, u = !e.opts.allErrors, l = e.util.copy(e), h = "";
    l.level++;
    var f = "valid" + l.level, p = l.baseId, d = !0, g = n;
    if (g)
      for (var v, y = -1, _ = g.length - 1; y < _;)
        v = g[y += 1], (e.opts.strictKeywords ? typeof v == "object" && Object.keys(v).length > 0 || v === !1 : e.util.schemaHasRules(v, e.RULES.all)) && (d = !1, l.schema = v, l.schemaPath = o + "[" + y + "]", l.errSchemaPath = i + "/" + y, t += "  " + e.validate(l) + " ", l.baseId = p, u && (t += " if (" + f + ") { ", h += "}"));
    return u && (d ? t += " if (true) { " : t += " " + h.slice(0, -1) + " "), t;
  }), Wa;
}
var Qa, oi;
function Lu() {
  return oi || (oi = 1, Qa = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = "errs__" + n, g = e.util.copy(e), v = "";
    g.level++;
    var y = "valid" + g.level, _ = i.every(function (T) {
      return e.opts.strictKeywords ? typeof T == "object" && Object.keys(T).length > 0 || T === !1 : e.util.schemaHasRules(T, e.RULES.all);
    });
    if (_) {
      var D = g.baseId;
      t += " var " + d + " = errors; var " + p + " = false;  ";
      var O = e.compositeRule;
      e.compositeRule = g.compositeRule = !0;
      var S = i;
      if (S)
        for (var x, E = -1, C = S.length - 1; E < C;)
          x = S[E += 1], g.schema = x, g.schemaPath = u + "[" + E + "]", g.errSchemaPath = l + "/" + E, t += "  " + e.validate(g) + " ", g.baseId = D, t += " " + p + " = " + p + " || " + y + "; if (!" + p + ") { ", v += "}";
      e.compositeRule = g.compositeRule = O, t += " " + v + " if (!" + p + ") {   var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'anyOf' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: {} ", e.opts.messages !== !1 && (t += " , message: 'should match some schema in anyOf' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", !e.compositeRule && h && (e.async ? t += " throw new ValidationError(vErrors); " : t += " validate.errors = vErrors; return false; "), t += " } else {  errors = " + d + "; if (vErrors !== null) { if (" + d + ") vErrors.length = " + d + "; else vErrors = null; } ", e.opts.allErrors && (t += " } ");
    } else
      h && (t += " if (true) { ");
    return t;
  }), Qa;
}
var Ga, ci;
function Uu() {
  return ci || (ci = 1, Ga = function (e, r, a) {
    var t = " ", n = e.schema[r], o = e.errSchemaPath + "/" + r;
    e.opts.allErrors;
    var i = e.util.toQuotedString(n);
    return e.opts.$comment === !0 ? t += " console.log(" + i + ");" : typeof e.opts.$comment == "function" && (t += " self._opts.$comment(" + i + ", " + e.util.toQuotedString(o) + ", validate.root.schema);"), t;
  }), Ga;
}
var Ja, li;
function qu() {
  return li || (li = 1, Ja = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = e.opts.$data && i && i.$data;
    d && (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; "), d || (t += " var schema" + n + " = validate.schema" + u + ";"), t += "var " + p + " = equal(" + f + ", schema" + n + "); if (!" + p + ") {   ";
    var g = g || [];
    g.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'const' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { allowedValue: schema" + n + " } ", e.opts.messages !== !1 && (t += " , message: 'should be equal to constant' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var v = t;
    return t = g.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + v + "]); " : t += " validate.errors = [" + v + "]; return false; " : t += " var err = " + v + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " }", h && (t += " else { "), t;
  }), Ja;
}
var Ka, ui;
function zu() {
  return ui || (ui = 1, Ka = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = "errs__" + n, g = e.util.copy(e), v = "";
    g.level++;
    var y = "valid" + g.level, _ = "i" + n, D = g.dataLevel = e.dataLevel + 1, O = "data" + D, S = e.baseId, x = e.opts.strictKeywords ? typeof i == "object" && Object.keys(i).length > 0 || i === !1 : e.util.schemaHasRules(i, e.RULES.all);
    if (t += "var " + d + " = errors;var " + p + ";", x) {
      var E = e.compositeRule;
      e.compositeRule = g.compositeRule = !0, g.schema = i, g.schemaPath = u, g.errSchemaPath = l, t += " var " + y + " = false; for (var " + _ + " = 0; " + _ + " < " + f + ".length; " + _ + "++) { ", g.errorPath = e.util.getPathExpr(e.errorPath, _, e.opts.jsonPointers, !0);
      var C = f + "[" + _ + "]";
      g.dataPathArr[D] = _;
      var T = e.validate(g);
      g.baseId = S, e.util.varOccurences(T, O) < 2 ? t += " " + e.util.varReplace(T, O, C) + " " : t += " var " + O + " = " + C + "; " + T + " ", t += " if (" + y + ") break; }  ", e.compositeRule = g.compositeRule = E, t += " " + v + " if (!" + y + ") {";
    } else
      t += " if (" + f + ".length == 0) {";
    var k = k || [];
    k.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'contains' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: {} ", e.opts.messages !== !1 && (t += " , message: 'should contain a valid item' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var P = t;
    return t = k.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + P + "]); " : t += " validate.errors = [" + P + "]; return false; " : t += " var err = " + P + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } else { ", x && (t += "  errors = " + d + "; if (vErrors !== null) { if (" + d + ") vErrors.length = " + d + "; else vErrors = null; } "), e.opts.allErrors && (t += " } "), t;
  }), Ka;
}
var Ya, di;
function Vu() {
  return di || (di = 1, Ya = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "errs__" + n, d = e.util.copy(e), g = "";
    d.level++;
    var v = "valid" + d.level, y = {}, _ = {}, D = e.opts.ownProperties;
    for (E in i)
      if (E != "__proto__") {
        var O = i[E], S = Array.isArray(O) ? _ : y;
        S[E] = O;
      }
    t += "var " + p + " = errors;";
    var x = e.errorPath;
    t += "var missing" + n + ";";
    for (var E in _)
      if (S = _[E], S.length) {
        if (t += " if ( " + f + e.util.getProperty(E) + " !== undefined ", D && (t += " && Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(E) + "') "), h) {
          t += " && ( ";
          var C = S;
          if (C)
            for (var T, k = -1, P = C.length - 1; k < P;) {
              T = C[k += 1], k && (t += " || ");
              var R = e.util.getProperty(T), F = f + R;
              t += " ( ( " + F + " === undefined ", D && (t += " || ! Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(T) + "') "), t += ") && (missing" + n + " = " + e.util.toQuotedString(e.opts.jsonPointers ? T : R) + ") ) ";
            }
          t += ")) {  ";
          var N = "missing" + n, j = "' + " + N + " + '";
          e.opts._errorDataPathProperty && (e.errorPath = e.opts.jsonPointers ? e.util.getPathExpr(x, N, !0) : x + " + " + N);
          var V = V || [];
          V.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'dependencies' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { property: '" + e.util.escapeQuotes(E) + "', missingProperty: '" + j + "', depsCount: " + S.length + ", deps: '" + e.util.escapeQuotes(S.length == 1 ? S[0] : S.join(", ")) + "' } ", e.opts.messages !== !1 && (t += " , message: 'should have ", S.length == 1 ? t += "property " + e.util.escapeQuotes(S[0]) : t += "properties " + e.util.escapeQuotes(S.join(", ")), t += " when property " + e.util.escapeQuotes(E) + " is present' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
          var X = t;
          t = V.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + X + "]); " : t += " validate.errors = [" + X + "]; return false; " : t += " var err = " + X + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        } else {
          t += " ) { ";
          var J = S;
          if (J)
            for (var T, Y = -1, te = J.length - 1; Y < te;) {
              T = J[Y += 1];
              var R = e.util.getProperty(T), j = e.util.escapeQuotes(T), F = f + R;
              e.opts._errorDataPathProperty && (e.errorPath = e.util.getPath(x, T, e.opts.jsonPointers)), t += " if ( " + F + " === undefined ", D && (t += " || ! Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(T) + "') "), t += ") {  var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'dependencies' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { property: '" + e.util.escapeQuotes(E) + "', missingProperty: '" + j + "', depsCount: " + S.length + ", deps: '" + e.util.escapeQuotes(S.length == 1 ? S[0] : S.join(", ")) + "' } ", e.opts.messages !== !1 && (t += " , message: 'should have ", S.length == 1 ? t += "property " + e.util.escapeQuotes(S[0]) : t += "properties " + e.util.escapeQuotes(S.join(", ")), t += " when property " + e.util.escapeQuotes(E) + " is present' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
            }
        }
        t += " }   ", h && (g += "}", t += " else { ");
      }
    e.errorPath = x;
    var ne = d.baseId;
    for (var E in y) {
      var O = y[E];
      (e.opts.strictKeywords ? typeof O == "object" && Object.keys(O).length > 0 || O === !1 : e.util.schemaHasRules(O, e.RULES.all)) && (t += " " + v + " = true; if ( " + f + e.util.getProperty(E) + " !== undefined ", D && (t += " && Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(E) + "') "), t += ") { ", d.schema = O, d.schemaPath = u + e.util.getProperty(E), d.errSchemaPath = l + "/" + e.util.escapeFragment(E), t += "  " + e.validate(d) + " ", d.baseId = ne, t += " }  ", h && (t += " if (" + v + ") { ", g += "}"));
    }
    return h && (t += "   " + g + " if (" + p + " == errors) {"), t;
  }), Ya;
}
var Xa, hi;
function Hu() {
  return hi || (hi = 1, Xa = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = e.opts.$data && i && i.$data;
    d && (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ");
    var g = "i" + n, v = "schema" + n;
    d || (t += " var " + v + " = validate.schema" + u + ";"), t += "var " + p + ";", d && (t += " if (schema" + n + " === undefined) " + p + " = true; else if (!Array.isArray(schema" + n + ")) " + p + " = false; else {"), t += "" + p + " = false;for (var " + g + "=0; " + g + "<" + v + ".length; " + g + "++) if (equal(" + f + ", " + v + "[" + g + "])) { " + p + " = true; break; }", d && (t += "  }  "), t += " if (!" + p + ") {   ";
    var y = y || [];
    y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'enum' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { allowedValues: schema" + n + " } ", e.opts.messages !== !1 && (t += " , message: 'should be equal to one of the allowed values' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var _ = t;
    return t = y.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " }", h && (t += " else { "), t;
  }), Xa;
}
var es, fi;
function Bu() {
  return fi || (fi = 1, es = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || "");
    if (e.opts.format === !1)
      return h && (t += " if (true) { "), t;
    var p = e.opts.$data && i && i.$data, d;
    p ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", d = "schema" + n) : d = i;
    var g = e.opts.unknownFormats, v = Array.isArray(g);
    if (p) {
      var y = "format" + n, _ = "isObject" + n, D = "formatType" + n;
      t += " var " + y + " = formats[" + d + "]; var " + _ + " = typeof " + y + " == 'object' && !(" + y + " instanceof RegExp) && " + y + ".validate; var " + D + " = " + _ + " && " + y + ".type || 'string'; if (" + _ + ") { ", e.async && (t += " var async" + n + " = " + y + ".async; "), t += " " + y + " = " + y + ".validate; } if (  ", p && (t += " (" + d + " !== undefined && typeof " + d + " != 'string') || "), t += " (", g != "ignore" && (t += " (" + d + " && !" + y + " ", v && (t += " && self._opts.unknownFormats.indexOf(" + d + ") == -1 "), t += ") || "), t += " (" + y + " && " + D + " == '" + a + "' && !(typeof " + y + " == 'function' ? ", e.async ? t += " (async" + n + " ? await " + y + "(" + f + ") : " + y + "(" + f + ")) " : t += " " + y + "(" + f + ") ", t += " : " + y + ".test(" + f + "))))) {";
    } else {
      var y = e.formats[i];
      if (!y) {
        if (g == "ignore")
          return e.logger.warn('unknown format "' + i + '" ignored in schema at path "' + e.errSchemaPath + '"'), h && (t += " if (true) { "), t;
        if (v && g.indexOf(i) >= 0)
          return h && (t += " if (true) { "), t;
        throw new Error('unknown format "' + i + '" is used in schema at path "' + e.errSchemaPath + '"');
      }
      var _ = typeof y == "object" && !(y instanceof RegExp) && y.validate, D = _ && y.type || "string";
      if (_) {
        var O = y.async === !0;
        y = y.validate;
      }
      if (D != a)
        return h && (t += " if (true) { "), t;
      if (O) {
        if (!e.async) throw new Error("async format in sync schema");
        var S = "formats" + e.util.getProperty(i) + ".validate";
        t += " if (!(await " + S + "(" + f + "))) { ";
      } else {
        t += " if (! ";
        var S = "formats" + e.util.getProperty(i);
        _ && (S += ".validate"), typeof y == "function" ? t += " " + S + "(" + f + ") " : t += " " + S + ".test(" + f + ") ", t += ") { ";
      }
    }
    var x = x || [];
    x.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'format' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { format:  ", p ? t += "" + d : t += "" + e.util.toQuotedString(i), t += "  } ", e.opts.messages !== !1 && (t += ` , message: 'should match format "`, p ? t += "' + " + d + " + '" : t += "" + e.util.escapeQuotes(i), t += `"' `), e.opts.verbose && (t += " , schema:  ", p ? t += "validate.schema" + u : t += "" + e.util.toQuotedString(i), t += "         , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var E = t;
    return t = x.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + E + "]); " : t += " validate.errors = [" + E + "]; return false; " : t += " var err = " + E + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } ", h && (t += " else { "), t;
  }), es;
}
var ts, pi;
function Zu() {
  return pi || (pi = 1, ts = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = "errs__" + n, g = e.util.copy(e);
    g.level++;
    var v = "valid" + g.level, y = e.schema.then, _ = e.schema.else, D = y !== void 0 && (e.opts.strictKeywords ? typeof y == "object" && Object.keys(y).length > 0 || y === !1 : e.util.schemaHasRules(y, e.RULES.all)), O = _ !== void 0 && (e.opts.strictKeywords ? typeof _ == "object" && Object.keys(_).length > 0 || _ === !1 : e.util.schemaHasRules(_, e.RULES.all)), S = g.baseId;
    if (D || O) {
      var x;
      g.createErrors = !1, g.schema = i, g.schemaPath = u, g.errSchemaPath = l, t += " var " + d + " = errors; var " + p + " = true;  ";
      var E = e.compositeRule;
      e.compositeRule = g.compositeRule = !0, t += "  " + e.validate(g) + " ", g.baseId = S, g.createErrors = !0, t += "  errors = " + d + "; if (vErrors !== null) { if (" + d + ") vErrors.length = " + d + "; else vErrors = null; }  ", e.compositeRule = g.compositeRule = E, D ? (t += " if (" + v + ") {  ", g.schema = e.schema.then, g.schemaPath = e.schemaPath + ".then", g.errSchemaPath = e.errSchemaPath + "/then", t += "  " + e.validate(g) + " ", g.baseId = S, t += " " + p + " = " + v + "; ", D && O ? (x = "ifClause" + n, t += " var " + x + " = 'then'; ") : x = "'then'", t += " } ", O && (t += " else { ")) : t += " if (!" + v + ") { ", O && (g.schema = e.schema.else, g.schemaPath = e.schemaPath + ".else", g.errSchemaPath = e.errSchemaPath + "/else", t += "  " + e.validate(g) + " ", g.baseId = S, t += " " + p + " = " + v + "; ", D && O ? (x = "ifClause" + n, t += " var " + x + " = 'else'; ") : x = "'else'", t += " } "), t += " if (!" + p + ") {   var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'if' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { failingKeyword: " + x + " } ", e.opts.messages !== !1 && (t += ` , message: 'should match "' + ` + x + ` + '" schema' `), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", !e.compositeRule && h && (e.async ? t += " throw new ValidationError(vErrors); " : t += " validate.errors = vErrors; return false; "), t += " }   ", h && (t += " else { ");
    } else
      h && (t += " if (true) { ");
    return t;
  }), ts;
}
var rs, mi;
function Wu() {
  return mi || (mi = 1, rs = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = "errs__" + n, g = e.util.copy(e), v = "";
    g.level++;
    var y = "valid" + g.level, _ = "i" + n, D = g.dataLevel = e.dataLevel + 1, O = "data" + D, S = e.baseId;
    if (t += "var " + d + " = errors;var " + p + ";", Array.isArray(i)) {
      var x = e.schema.additionalItems;
      if (x === !1) {
        t += " " + p + " = " + f + ".length <= " + i.length + "; ";
        var E = l;
        l = e.errSchemaPath + "/additionalItems", t += "  if (!" + p + ") {   ";
        var C = C || [];
        C.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'additionalItems' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { limit: " + i.length + " } ", e.opts.messages !== !1 && (t += " , message: 'should NOT have more than " + i.length + " items' "), e.opts.verbose && (t += " , schema: false , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
        var T = t;
        t = C.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + T + "]); " : t += " validate.errors = [" + T + "]; return false; " : t += " var err = " + T + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } ", l = E, h && (v += "}", t += " else { ");
      }
      var k = i;
      if (k) {
        for (var P, R = -1, F = k.length - 1; R < F;)
          if (P = k[R += 1], e.opts.strictKeywords ? typeof P == "object" && Object.keys(P).length > 0 || P === !1 : e.util.schemaHasRules(P, e.RULES.all)) {
            t += " " + y + " = true; if (" + f + ".length > " + R + ") { ";
            var N = f + "[" + R + "]";
            g.schema = P, g.schemaPath = u + "[" + R + "]", g.errSchemaPath = l + "/" + R, g.errorPath = e.util.getPathExpr(e.errorPath, R, e.opts.jsonPointers, !0), g.dataPathArr[D] = R;
            var j = e.validate(g);
            g.baseId = S, e.util.varOccurences(j, O) < 2 ? t += " " + e.util.varReplace(j, O, N) + " " : t += " var " + O + " = " + N + "; " + j + " ", t += " }  ", h && (t += " if (" + y + ") { ", v += "}");
          }
      }
      if (typeof x == "object" && (e.opts.strictKeywords ? typeof x == "object" && Object.keys(x).length > 0 || x === !1 : e.util.schemaHasRules(x, e.RULES.all))) {
        g.schema = x, g.schemaPath = e.schemaPath + ".additionalItems", g.errSchemaPath = e.errSchemaPath + "/additionalItems", t += " " + y + " = true; if (" + f + ".length > " + i.length + ") {  for (var " + _ + " = " + i.length + "; " + _ + " < " + f + ".length; " + _ + "++) { ", g.errorPath = e.util.getPathExpr(e.errorPath, _, e.opts.jsonPointers, !0);
        var N = f + "[" + _ + "]";
        g.dataPathArr[D] = _;
        var j = e.validate(g);
        g.baseId = S, e.util.varOccurences(j, O) < 2 ? t += " " + e.util.varReplace(j, O, N) + " " : t += " var " + O + " = " + N + "; " + j + " ", h && (t += " if (!" + y + ") break; "), t += " } }  ", h && (t += " if (" + y + ") { ", v += "}");
      }
    } else if (e.opts.strictKeywords ? typeof i == "object" && Object.keys(i).length > 0 || i === !1 : e.util.schemaHasRules(i, e.RULES.all)) {
      g.schema = i, g.schemaPath = u, g.errSchemaPath = l, t += "  for (var " + _ + " = 0; " + _ + " < " + f + ".length; " + _ + "++) { ", g.errorPath = e.util.getPathExpr(e.errorPath, _, e.opts.jsonPointers, !0);
      var N = f + "[" + _ + "]";
      g.dataPathArr[D] = _;
      var j = e.validate(g);
      g.baseId = S, e.util.varOccurences(j, O) < 2 ? t += " " + e.util.varReplace(j, O, N) + " " : t += " var " + O + " = " + N + "; " + j + " ", h && (t += " if (!" + y + ") break; "), t += " }";
    }
    return h && (t += " " + v + " if (" + d + " == errors) {"), t;
  }), rs;
}
var as, gi;
function vi() {
  return gi || (gi = 1, as = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, S, f = "data" + (o || ""), p = e.opts.$data && i && i.$data, d;
    p ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", d = "schema" + n) : d = i;
    var g = r == "maximum", v = g ? "exclusiveMaximum" : "exclusiveMinimum", y = e.schema[v], _ = e.opts.$data && y && y.$data, D = g ? "<" : ">", O = g ? ">" : "<", S = void 0;
    if (!(p || typeof i == "number" || i === void 0))
      throw new Error(r + " must be number");
    if (!(_ || y === void 0 || typeof y == "number" || typeof y == "boolean"))
      throw new Error(v + " must be number or boolean");
    if (_) {
      var x = e.util.getData(y.$data, o, e.dataPathArr), E = "exclusive" + n, C = "exclType" + n, T = "exclIsNumber" + n, k = "op" + n, P = "' + " + k + " + '";
      t += " var schemaExcl" + n + " = " + x + "; ", x = "schemaExcl" + n, t += " var " + E + "; var " + C + " = typeof " + x + "; if (" + C + " != 'boolean' && " + C + " != 'undefined' && " + C + " != 'number') { ";
      var S = v, R = R || [];
      R.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (S || "_exclusiveLimit") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: {} ", e.opts.messages !== !1 && (t += " , message: '" + v + " should be boolean' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
      var F = t;
      t = R.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + F + "]); " : t += " validate.errors = [" + F + "]; return false; " : t += " var err = " + F + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } else if ( ", p && (t += " (" + d + " !== undefined && typeof " + d + " != 'number') || "), t += " " + C + " == 'number' ? ( (" + E + " = " + d + " === undefined || " + x + " " + D + "= " + d + ") ? " + f + " " + O + "= " + x + " : " + f + " " + O + " " + d + " ) : ( (" + E + " = " + x + " === true) ? " + f + " " + O + "= " + d + " : " + f + " " + O + " " + d + " ) || " + f + " !== " + f + ") { var op" + n + " = " + E + " ? '" + D + "' : '" + D + "='; ", i === void 0 && (S = v, l = e.errSchemaPath + "/" + v, d = x, p = _);
    } else {
      var T = typeof y == "number", P = D;
      if (T && p) {
        var k = "'" + P + "'";
        t += " if ( ", p && (t += " (" + d + " !== undefined && typeof " + d + " != 'number') || "), t += " ( " + d + " === undefined || " + y + " " + D + "= " + d + " ? " + f + " " + O + "= " + y + " : " + f + " " + O + " " + d + " ) || " + f + " !== " + f + ") { ";
      } else {
        T && i === void 0 ? (E = !0, S = v, l = e.errSchemaPath + "/" + v, d = y, O += "=") : (T && (d = Math[g ? "min" : "max"](y, i)), y === (T ? d : !0) ? (E = !0, S = v, l = e.errSchemaPath + "/" + v, O += "=") : (E = !1, P += "="));
        var k = "'" + P + "'";
        t += " if ( ", p && (t += " (" + d + " !== undefined && typeof " + d + " != 'number') || "), t += " " + f + " " + O + " " + d + " || " + f + " !== " + f + ") { ";
      }
    }
    S = S || r;
    var R = R || [];
    R.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (S || "_limit") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { comparison: " + k + ", limit: " + d + ", exclusive: " + E + " } ", e.opts.messages !== !1 && (t += " , message: 'should be " + P + " ", p ? t += "' + " + d : t += "" + d + "'"), e.opts.verbose && (t += " , schema:  ", p ? t += "validate.schema" + u : t += "" + i, t += "         , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var F = t;
    return t = R.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + F + "]); " : t += " validate.errors = [" + F + "]; return false; " : t += " var err = " + F + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } ", h && (t += " else { "), t;
  }), as;
}
var ss, yi;
function _i() {
  return yi || (yi = 1, ss = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, v, f = "data" + (o || ""), p = e.opts.$data && i && i.$data, d;
    if (p ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", d = "schema" + n) : d = i, !(p || typeof i == "number"))
      throw new Error(r + " must be number");
    var g = r == "maxItems" ? ">" : "<";
    t += "if ( ", p && (t += " (" + d + " !== undefined && typeof " + d + " != 'number') || "), t += " " + f + ".length " + g + " " + d + ") { ";
    var v = r, y = y || [];
    y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (v || "_limitItems") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { limit: " + d + " } ", e.opts.messages !== !1 && (t += " , message: 'should NOT have ", r == "maxItems" ? t += "more" : t += "fewer", t += " than ", p ? t += "' + " + d + " + '" : t += "" + i, t += " items' "), e.opts.verbose && (t += " , schema:  ", p ? t += "validate.schema" + u : t += "" + i, t += "         , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var _ = t;
    return t = y.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += "} ", h && (t += " else { "), t;
  }), ss;
}
var ns, bi;
function wi() {
  return bi || (bi = 1, ns = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, v, f = "data" + (o || ""), p = e.opts.$data && i && i.$data, d;
    if (p ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", d = "schema" + n) : d = i, !(p || typeof i == "number"))
      throw new Error(r + " must be number");
    var g = r == "maxLength" ? ">" : "<";
    t += "if ( ", p && (t += " (" + d + " !== undefined && typeof " + d + " != 'number') || "), e.opts.unicode === !1 ? t += " " + f + ".length " : t += " ucs2length(" + f + ") ", t += " " + g + " " + d + ") { ";
    var v = r, y = y || [];
    y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (v || "_limitLength") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { limit: " + d + " } ", e.opts.messages !== !1 && (t += " , message: 'should NOT be ", r == "maxLength" ? t += "longer" : t += "shorter", t += " than ", p ? t += "' + " + d + " + '" : t += "" + i, t += " characters' "), e.opts.verbose && (t += " , schema:  ", p ? t += "validate.schema" + u : t += "" + i, t += "         , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var _ = t;
    return t = y.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += "} ", h && (t += " else { "), t;
  }), ns;
}
var is, Ei;
function Si() {
  return Ei || (Ei = 1, is = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, v, f = "data" + (o || ""), p = e.opts.$data && i && i.$data, d;
    if (p ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", d = "schema" + n) : d = i, !(p || typeof i == "number"))
      throw new Error(r + " must be number");
    var g = r == "maxProperties" ? ">" : "<";
    t += "if ( ", p && (t += " (" + d + " !== undefined && typeof " + d + " != 'number') || "), t += " Object.keys(" + f + ").length " + g + " " + d + ") { ";
    var v = r, y = y || [];
    y.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (v || "_limitProperties") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { limit: " + d + " } ", e.opts.messages !== !1 && (t += " , message: 'should NOT have ", r == "maxProperties" ? t += "more" : t += "fewer", t += " than ", p ? t += "' + " + d + " + '" : t += "" + i, t += " properties' "), e.opts.verbose && (t += " , schema:  ", p ? t += "validate.schema" + u : t += "" + i, t += "         , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var _ = t;
    return t = y.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + _ + "]); " : t += " validate.errors = [" + _ + "]; return false; " : t += " var err = " + _ + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += "} ", h && (t += " else { "), t;
  }), is;
}
var os, Pi;
function Qu() {
  return Pi || (Pi = 1, os = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = e.opts.$data && i && i.$data, d;
    if (p ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", d = "schema" + n) : d = i, !(p || typeof i == "number"))
      throw new Error(r + " must be number");
    t += "var division" + n + ";if (", p && (t += " " + d + " !== undefined && ( typeof " + d + " != 'number' || "), t += " (division" + n + " = " + f + " / " + d + ", ", e.opts.multipleOfPrecision ? t += " Math.abs(Math.round(division" + n + ") - division" + n + ") > 1e-" + e.opts.multipleOfPrecision + " " : t += " division" + n + " !== parseInt(division" + n + ") ", t += " ) ", p && (t += "  )  "), t += " ) {   ";
    var g = g || [];
    g.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'multipleOf' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { multipleOf: " + d + " } ", e.opts.messages !== !1 && (t += " , message: 'should be multiple of ", p ? t += "' + " + d : t += "" + d + "'"), e.opts.verbose && (t += " , schema:  ", p ? t += "validate.schema" + u : t += "" + i, t += "         , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var v = t;
    return t = g.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + v + "]); " : t += " validate.errors = [" + v + "]; return false; " : t += " var err = " + v + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += "} ", h && (t += " else { "), t;
  }), os;
}
var cs, Ci;
function Gu() {
  return Ci || (Ci = 1, cs = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "errs__" + n, d = e.util.copy(e);
    d.level++;
    var g = "valid" + d.level;
    if (e.opts.strictKeywords ? typeof i == "object" && Object.keys(i).length > 0 || i === !1 : e.util.schemaHasRules(i, e.RULES.all)) {
      d.schema = i, d.schemaPath = u, d.errSchemaPath = l, t += " var " + p + " = errors;  ";
      var v = e.compositeRule;
      e.compositeRule = d.compositeRule = !0, d.createErrors = !1;
      var y;
      d.opts.allErrors && (y = d.opts.allErrors, d.opts.allErrors = !1), t += " " + e.validate(d) + " ", d.createErrors = !0, y && (d.opts.allErrors = y), e.compositeRule = d.compositeRule = v, t += " if (" + g + ") {   ";
      var _ = _ || [];
      _.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'not' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: {} ", e.opts.messages !== !1 && (t += " , message: 'should NOT be valid' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
      var D = t;
      t = _.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + D + "]); " : t += " validate.errors = [" + D + "]; return false; " : t += " var err = " + D + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } else {  errors = " + p + "; if (vErrors !== null) { if (" + p + ") vErrors.length = " + p + "; else vErrors = null; } ", e.opts.allErrors && (t += " } ");
    } else
      t += "  var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'not' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: {} ", e.opts.messages !== !1 && (t += " , message: 'should NOT be valid' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", h && (t += " if (false) { ");
    return t;
  }), cs;
}
var ls, xi;
function Ju() {
  return xi || (xi = 1, ls = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = "errs__" + n, g = e.util.copy(e), v = "";
    g.level++;
    var y = "valid" + g.level, _ = g.baseId, D = "prevValid" + n, O = "passingSchemas" + n;
    t += "var " + d + " = errors , " + D + " = false , " + p + " = false , " + O + " = null; ";
    var S = e.compositeRule;
    e.compositeRule = g.compositeRule = !0;
    var x = i;
    if (x)
      for (var E, C = -1, T = x.length - 1; C < T;)
        E = x[C += 1], (e.opts.strictKeywords ? typeof E == "object" && Object.keys(E).length > 0 || E === !1 : e.util.schemaHasRules(E, e.RULES.all)) ? (g.schema = E, g.schemaPath = u + "[" + C + "]", g.errSchemaPath = l + "/" + C, t += "  " + e.validate(g) + " ", g.baseId = _) : t += " var " + y + " = true; ", C && (t += " if (" + y + " && " + D + ") { " + p + " = false; " + O + " = [" + O + ", " + C + "]; } else { ", v += "}"), t += " if (" + y + ") { " + p + " = " + D + " = true; " + O + " = " + C + "; }";
    return e.compositeRule = g.compositeRule = S, t += "" + v + "if (!" + p + ") {   var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'oneOf' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { passingSchemas: " + O + " } ", e.opts.messages !== !1 && (t += " , message: 'should match exactly one schema in oneOf' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", !e.compositeRule && h && (e.async ? t += " throw new ValidationError(vErrors); " : t += " validate.errors = vErrors; return false; "), t += "} else {  errors = " + d + "; if (vErrors !== null) { if (" + d + ") vErrors.length = " + d + "; else vErrors = null; }", e.opts.allErrors && (t += " } "), t;
  }), ls;
}
var us, Ai;
function Ku() {
  return Ai || (Ai = 1, us = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = e.opts.$data && i && i.$data, d;
    p ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", d = "schema" + n) : d = i;
    var g = p ? "(new RegExp(" + d + "))" : e.usePattern(i);
    t += "if ( ", p && (t += " (" + d + " !== undefined && typeof " + d + " != 'string') || "), t += " !" + g + ".test(" + f + ") ) {   ";
    var v = v || [];
    v.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'pattern' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { pattern:  ", p ? t += "" + d : t += "" + e.util.toQuotedString(i), t += "  } ", e.opts.messages !== !1 && (t += ` , message: 'should match pattern "`, p ? t += "' + " + d + " + '" : t += "" + e.util.escapeQuotes(i), t += `"' `), e.opts.verbose && (t += " , schema:  ", p ? t += "validate.schema" + u : t += "" + e.util.toQuotedString(i), t += "         , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
    var y = t;
    return t = v.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + y + "]); " : t += " validate.errors = [" + y + "]; return false; " : t += " var err = " + y + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += "} ", h && (t += " else { "), t;
  }), us;
}
var ds, Ri;
function Yu() {
  return Ri || (Ri = 1, ds = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "errs__" + n, d = e.util.copy(e), g = "";
    d.level++;
    var v = "valid" + d.level, y = "key" + n, _ = "idx" + n, D = d.dataLevel = e.dataLevel + 1, O = "data" + D, S = "dataProperties" + n, x = Object.keys(i || {}).filter(Y), E = e.schema.patternProperties || {}, C = Object.keys(E).filter(Y), T = e.schema.additionalProperties, k = x.length || C.length, P = T === !1, R = typeof T == "object" && Object.keys(T).length, F = e.opts.removeAdditional, N = P || R || F, j = e.opts.ownProperties, V = e.baseId, X = e.schema.required;
    if (X && !(e.opts.$data && X.$data) && X.length < e.opts.loopRequired)
      var J = e.util.toHash(X);
    function Y(Ta) {
      return Ta !== "__proto__";
    }
    if (t += "var " + p + " = errors;var " + v + " = true;", j && (t += " var " + S + " = undefined;"), N) {
      if (j ? t += " " + S + " = " + S + " || Object.keys(" + f + "); for (var " + _ + "=0; " + _ + "<" + S + ".length; " + _ + "++) { var " + y + " = " + S + "[" + _ + "]; " : t += " for (var " + y + " in " + f + ") { ", k) {
        if (t += " var isAdditional" + n + " = !(false ", x.length)
          if (x.length > 8)
            t += " || validate.schema" + u + ".hasOwnProperty(" + y + ") ";
          else {
            var te = x;
            if (te)
              for (var ne, Ze = -1, Ue = te.length - 1; Ze < Ue;)
                ne = te[Ze += 1], t += " || " + y + " == " + e.util.toQuotedString(ne) + " ";
          }
        if (C.length) {
          var je = C;
          if (je)
            for (var Te, nt = -1, A = je.length - 1; nt < A;)
              Te = je[nt += 1], t += " || " + e.usePattern(Te) + ".test(" + y + ") ";
        }
        t += " ); if (isAdditional" + n + ") { ";
      }
      if (F == "all")
        t += " delete " + f + "[" + y + "]; ";
      else {
        var M = e.errorPath, Z = "' + " + y + " + '";
        if (e.opts._errorDataPathProperty && (e.errorPath = e.util.getPathExpr(e.errorPath, y, e.opts.jsonPointers)), P)
          if (F)
            t += " delete " + f + "[" + y + "]; ";
          else {
            t += " " + v + " = false; ";
            var se = l;
            l = e.errSchemaPath + "/additionalProperties";
            var L = L || [];
            L.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'additionalProperties' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { additionalProperty: '" + Z + "' } ", e.opts.messages !== !1 && (t += " , message: '", e.opts._errorDataPathProperty ? t += "is an invalid additional property" : t += "should NOT have additional properties", t += "' "), e.opts.verbose && (t += " , schema: false , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
            var z = t;
            t = L.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + z + "]); " : t += " validate.errors = [" + z + "]; return false; " : t += " var err = " + z + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", l = se, h && (t += " break; ");
          }
        else if (R)
          if (F == "failing") {
            t += " var " + p + " = errors;  ";
            var le = e.compositeRule;
            e.compositeRule = d.compositeRule = !0, d.schema = T, d.schemaPath = e.schemaPath + ".additionalProperties", d.errSchemaPath = e.errSchemaPath + "/additionalProperties", d.errorPath = e.opts._errorDataPathProperty ? e.errorPath : e.util.getPathExpr(e.errorPath, y, e.opts.jsonPointers);
            var fe = f + "[" + y + "]";
            d.dataPathArr[D] = y;
            var de = e.validate(d);
            d.baseId = V, e.util.varOccurences(de, O) < 2 ? t += " " + e.util.varReplace(de, O, fe) + " " : t += " var " + O + " = " + fe + "; " + de + " ", t += " if (!" + v + ") { errors = " + p + "; if (validate.errors !== null) { if (errors) validate.errors.length = errors; else validate.errors = null; } delete " + f + "[" + y + "]; }  ", e.compositeRule = d.compositeRule = le;
          } else {
            d.schema = T, d.schemaPath = e.schemaPath + ".additionalProperties", d.errSchemaPath = e.errSchemaPath + "/additionalProperties", d.errorPath = e.opts._errorDataPathProperty ? e.errorPath : e.util.getPathExpr(e.errorPath, y, e.opts.jsonPointers);
            var fe = f + "[" + y + "]";
            d.dataPathArr[D] = y;
            var de = e.validate(d);
            d.baseId = V, e.util.varOccurences(de, O) < 2 ? t += " " + e.util.varReplace(de, O, fe) + " " : t += " var " + O + " = " + fe + "; " + de + " ", h && (t += " if (!" + v + ") break; ");
          }
        e.errorPath = M;
      }
      k && (t += " } "), t += " }  ", h && (t += " if (" + v + ") { ", g += "}");
    }
    var we = e.opts.useDefaults && !e.compositeRule;
    if (x.length) {
      var ve = x;
      if (ve)
        for (var ne, ye = -1, qe = ve.length - 1; ye < qe;) {
          ne = ve[ye += 1];
          var Ce = i[ne];
          if (e.opts.strictKeywords ? typeof Ce == "object" && Object.keys(Ce).length > 0 || Ce === !1 : e.util.schemaHasRules(Ce, e.RULES.all)) {
            var dt = e.util.getProperty(ne), fe = f + dt, We = we && Ce.default !== void 0;
            d.schema = Ce, d.schemaPath = u + dt, d.errSchemaPath = l + "/" + e.util.escapeFragment(ne), d.errorPath = e.util.getPath(e.errorPath, ne, e.opts.jsonPointers), d.dataPathArr[D] = e.util.toQuotedString(ne);
            var de = e.validate(d);
            if (d.baseId = V, e.util.varOccurences(de, O) < 2) {
              de = e.util.varReplace(de, O, fe);
              var Ae = fe;
            } else {
              var Ae = O;
              t += " var " + O + " = " + fe + "; ";
            }
            if (We)
              t += " " + de + " ";
            else {
              if (J && J[ne]) {
                t += " if ( " + Ae + " === undefined ", j && (t += " || ! Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(ne) + "') "), t += ") { " + v + " = false; ";
                var M = e.errorPath, se = l, ke = e.util.escapeQuotes(ne);
                e.opts._errorDataPathProperty && (e.errorPath = e.util.getPath(M, ne, e.opts.jsonPointers)), l = e.errSchemaPath + "/required";
                var L = L || [];
                L.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'required' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { missingProperty: '" + ke + "' } ", e.opts.messages !== !1 && (t += " , message: '", e.opts._errorDataPathProperty ? t += "is a required property" : t += "should have required property \\'" + ke + "\\'", t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
                var z = t;
                t = L.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + z + "]); " : t += " validate.errors = [" + z + "]; return false; " : t += " var err = " + z + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", l = se, e.errorPath = M, t += " } else { ";
              } else
                h ? (t += " if ( " + Ae + " === undefined ", j && (t += " || ! Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(ne) + "') "), t += ") { " + v + " = true; } else { ") : (t += " if (" + Ae + " !== undefined ", j && (t += " &&   Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(ne) + "') "), t += " ) { ");
              t += " " + de + " } ";
            }
          }
          h && (t += " if (" + v + ") { ", g += "}");
        }
    }
    if (C.length) {
      var Xe = C;
      if (Xe)
        for (var Te, ea = -1, Ra = Xe.length - 1; ea < Ra;) {
          Te = Xe[ea += 1];
          var Ce = E[Te];
          if (e.opts.strictKeywords ? typeof Ce == "object" && Object.keys(Ce).length > 0 || Ce === !1 : e.util.schemaHasRules(Ce, e.RULES.all)) {
            d.schema = Ce, d.schemaPath = e.schemaPath + ".patternProperties" + e.util.getProperty(Te), d.errSchemaPath = e.errSchemaPath + "/patternProperties/" + e.util.escapeFragment(Te), j ? t += " " + S + " = " + S + " || Object.keys(" + f + "); for (var " + _ + "=0; " + _ + "<" + S + ".length; " + _ + "++) { var " + y + " = " + S + "[" + _ + "]; " : t += " for (var " + y + " in " + f + ") { ", t += " if (" + e.usePattern(Te) + ".test(" + y + ")) { ", d.errorPath = e.util.getPathExpr(e.errorPath, y, e.opts.jsonPointers);
            var fe = f + "[" + y + "]";
            d.dataPathArr[D] = y;
            var de = e.validate(d);
            d.baseId = V, e.util.varOccurences(de, O) < 2 ? t += " " + e.util.varReplace(de, O, fe) + " " : t += " var " + O + " = " + fe + "; " + de + " ", h && (t += " if (!" + v + ") break; "), t += " } ", h && (t += " else " + v + " = true; "), t += " }  ", h && (t += " if (" + v + ") { ", g += "}");
          }
        }
    }
    return h && (t += " " + g + " if (" + p + " == errors) {"), t;
  }), ds;
}
var hs, Ti;
function Xu() {
  return Ti || (Ti = 1, hs = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "errs__" + n, d = e.util.copy(e), g = "";
    d.level++;
    var v = "valid" + d.level;
    if (t += "var " + p + " = errors;", e.opts.strictKeywords ? typeof i == "object" && Object.keys(i).length > 0 || i === !1 : e.util.schemaHasRules(i, e.RULES.all)) {
      d.schema = i, d.schemaPath = u, d.errSchemaPath = l;
      var y = "key" + n, _ = "idx" + n, D = "i" + n, O = "' + " + y + " + '", S = d.dataLevel = e.dataLevel + 1, x = "data" + S, E = "dataProperties" + n, C = e.opts.ownProperties, T = e.baseId;
      C && (t += " var " + E + " = undefined; "), C ? t += " " + E + " = " + E + " || Object.keys(" + f + "); for (var " + _ + "=0; " + _ + "<" + E + ".length; " + _ + "++) { var " + y + " = " + E + "[" + _ + "]; " : t += " for (var " + y + " in " + f + ") { ", t += " var startErrs" + n + " = errors; ";
      var k = y, P = e.compositeRule;
      e.compositeRule = d.compositeRule = !0;
      var R = e.validate(d);
      d.baseId = T, e.util.varOccurences(R, x) < 2 ? t += " " + e.util.varReplace(R, x, k) + " " : t += " var " + x + " = " + k + "; " + R + " ", e.compositeRule = d.compositeRule = P, t += " if (!" + v + ") { for (var " + D + "=startErrs" + n + "; " + D + "<errors; " + D + "++) { vErrors[" + D + "].propertyName = " + y + "; }   var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'propertyNames' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { propertyName: '" + O + "' } ", e.opts.messages !== !1 && (t += " , message: 'property name \\'" + O + "\\' is invalid' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", !e.compositeRule && h && (e.async ? t += " throw new ValidationError(vErrors); " : t += " validate.errors = vErrors; return false; "), h && (t += " break; "), t += " } }";
    }
    return h && (t += " " + g + " if (" + p + " == errors) {"), t;
  }), hs;
}
var fs, ki;
function ed() {
  return ki || (ki = 1, fs = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = e.opts.$data && i && i.$data;
    d && (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ");
    var g = "schema" + n;
    if (!d)
      if (i.length < e.opts.loopRequired && e.schema.properties && Object.keys(e.schema.properties).length) {
        var v = [], y = i;
        if (y)
          for (var _, D = -1, O = y.length - 1; D < O;) {
            _ = y[D += 1];
            var S = e.schema.properties[_];
            S && (e.opts.strictKeywords ? typeof S == "object" && Object.keys(S).length > 0 || S === !1 : e.util.schemaHasRules(S, e.RULES.all)) || (v[v.length] = _);
          }
      } else
        var v = i;
    if (d || v.length) {
      var x = e.errorPath, E = d || v.length >= e.opts.loopRequired, C = e.opts.ownProperties;
      if (h)
        if (t += " var missing" + n + "; ", E) {
          d || (t += " var " + g + " = validate.schema" + u + "; ");
          var T = "i" + n, k = "schema" + n + "[" + T + "]", P = "' + " + k + " + '";
          e.opts._errorDataPathProperty && (e.errorPath = e.util.getPathExpr(x, k, e.opts.jsonPointers)), t += " var " + p + " = true; ", d && (t += " if (schema" + n + " === undefined) " + p + " = true; else if (!Array.isArray(schema" + n + ")) " + p + " = false; else {"), t += " for (var " + T + " = 0; " + T + " < " + g + ".length; " + T + "++) { " + p + " = " + f + "[" + g + "[" + T + "]] !== undefined ", C && (t += " &&   Object.prototype.hasOwnProperty.call(" + f + ", " + g + "[" + T + "]) "), t += "; if (!" + p + ") break; } ", d && (t += "  }  "), t += "  if (!" + p + ") {   ";
          var R = R || [];
          R.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'required' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { missingProperty: '" + P + "' } ", e.opts.messages !== !1 && (t += " , message: '", e.opts._errorDataPathProperty ? t += "is a required property" : t += "should have required property \\'" + P + "\\'", t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
          var F = t;
          t = R.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + F + "]); " : t += " validate.errors = [" + F + "]; return false; " : t += " var err = " + F + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } else { ";
        } else {
          t += " if ( ";
          var N = v;
          if (N)
            for (var j, T = -1, V = N.length - 1; T < V;) {
              j = N[T += 1], T && (t += " || ");
              var X = e.util.getProperty(j), J = f + X;
              t += " ( ( " + J + " === undefined ", C && (t += " || ! Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(j) + "') "), t += ") && (missing" + n + " = " + e.util.toQuotedString(e.opts.jsonPointers ? j : X) + ") ) ";
            }
          t += ") {  ";
          var k = "missing" + n, P = "' + " + k + " + '";
          e.opts._errorDataPathProperty && (e.errorPath = e.opts.jsonPointers ? e.util.getPathExpr(x, k, !0) : x + " + " + k);
          var R = R || [];
          R.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'required' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { missingProperty: '" + P + "' } ", e.opts.messages !== !1 && (t += " , message: '", e.opts._errorDataPathProperty ? t += "is a required property" : t += "should have required property \\'" + P + "\\'", t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
          var F = t;
          t = R.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + F + "]); " : t += " validate.errors = [" + F + "]; return false; " : t += " var err = " + F + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } else { ";
        }
      else if (E) {
        d || (t += " var " + g + " = validate.schema" + u + "; ");
        var T = "i" + n, k = "schema" + n + "[" + T + "]", P = "' + " + k + " + '";
        e.opts._errorDataPathProperty && (e.errorPath = e.util.getPathExpr(x, k, e.opts.jsonPointers)), d && (t += " if (" + g + " && !Array.isArray(" + g + ")) {  var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'required' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { missingProperty: '" + P + "' } ", e.opts.messages !== !1 && (t += " , message: '", e.opts._errorDataPathProperty ? t += "is a required property" : t += "should have required property \\'" + P + "\\'", t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else if (" + g + " !== undefined) { "), t += " for (var " + T + " = 0; " + T + " < " + g + ".length; " + T + "++) { if (" + f + "[" + g + "[" + T + "]] === undefined ", C && (t += " || ! Object.prototype.hasOwnProperty.call(" + f + ", " + g + "[" + T + "]) "), t += ") {  var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'required' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { missingProperty: '" + P + "' } ", e.opts.messages !== !1 && (t += " , message: '", e.opts._errorDataPathProperty ? t += "is a required property" : t += "should have required property \\'" + P + "\\'", t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } } ", d && (t += "  }  ");
      } else {
        var Y = v;
        if (Y)
          for (var j, te = -1, ne = Y.length - 1; te < ne;) {
            j = Y[te += 1];
            var X = e.util.getProperty(j), P = e.util.escapeQuotes(j), J = f + X;
            e.opts._errorDataPathProperty && (e.errorPath = e.util.getPath(x, j, e.opts.jsonPointers)), t += " if ( " + J + " === undefined ", C && (t += " || ! Object.prototype.hasOwnProperty.call(" + f + ", '" + e.util.escapeQuotes(j) + "') "), t += ") {  var err =   ", e.createErrors !== !1 ? (t += " { keyword: 'required' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { missingProperty: '" + P + "' } ", e.opts.messages !== !1 && (t += " , message: '", e.opts._errorDataPathProperty ? t += "is a required property" : t += "should have required property \\'" + P + "\\'", t += "' "), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
          }
      }
      e.errorPath = x;
    } else h && (t += " if (true) {");
    return t;
  }), fs;
}
var ps, Ii;
function td() {
  return Ii || (Ii = 1, ps = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f = "data" + (o || ""), p = "valid" + n, d = e.opts.$data && i && i.$data, g;
    if (d ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", g = "schema" + n) : g = i, (i || d) && e.opts.uniqueItems !== !1) {
      d && (t += " var " + p + "; if (" + g + " === false || " + g + " === undefined) " + p + " = true; else if (typeof " + g + " != 'boolean') " + p + " = false; else { "), t += " var i = " + f + ".length , " + p + " = true , j; if (i > 1) { ";
      var v = e.schema.items && e.schema.items.type, y = Array.isArray(v);
      if (!v || v == "object" || v == "array" || y && (v.indexOf("object") >= 0 || v.indexOf("array") >= 0))
        t += " outer: for (;i--;) { for (j = i; j--;) { if (equal(" + f + "[i], " + f + "[j])) { " + p + " = false; break outer; } } } ";
      else {
        t += " var itemIndices = {}, item; for (;i--;) { var item = " + f + "[i]; ";
        var _ = "checkDataType" + (y ? "s" : "");
        t += " if (" + e.util[_](v, "item", e.opts.strictNumbers, !0) + ") continue; ", y && (t += ` if (typeof item == 'string') item = '"' + item; `), t += " if (typeof itemIndices[item] == 'number') { " + p + " = false; j = itemIndices[item]; break; } itemIndices[item] = i; } ";
      }
      t += " } ", d && (t += "  }  "), t += " if (!" + p + ") {   ";
      var D = D || [];
      D.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: 'uniqueItems' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { i: i, j: j } ", e.opts.messages !== !1 && (t += " , message: 'should NOT have duplicate items (items ## ' + j + ' and ' + i + ' are identical)' "), e.opts.verbose && (t += " , schema:  ", d ? t += "validate.schema" + u : t += "" + i, t += "         , parentSchema: validate.schema" + e.schemaPath + " , data: " + f + " "), t += " } ") : t += " {} ";
      var O = t;
      t = D.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + O + "]); " : t += " validate.errors = [" + O + "]; return false; " : t += " var err = " + O + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", t += " } ", h && (t += " else { ");
    } else
      h && (t += " if (true) { ");
    return t;
  }), ps;
}
var ms, $i;
function rd() {
  return $i || ($i = 1, ms = {
    $ref: Mu(),
    allOf: ju(),
    anyOf: Lu(),
    $comment: Uu(),
    const: qu(),
    contains: zu(),
    dependencies: Vu(),
    enum: Hu(),
    format: Bu(),
    if: Zu(),
    items: Wu(),
    maximum: vi(),
    minimum: vi(),
    maxItems: _i(),
    minItems: _i(),
    maxLength: wi(),
    minLength: wi(),
    maxProperties: Si(),
    minProperties: Si(),
    multipleOf: Qu(),
    not: Gu(),
    oneOf: Ju(),
    pattern: Ku(),
    properties: Yu(),
    propertyNames: Xu(),
    required: ed(),
    uniqueItems: td(),
    validate: Fo()
  }), ms;
}
var gs, Oi;
function ad() {
  if (Oi) return gs;
  Oi = 1;
  var s = rd(), e = wr().toHash;
  return gs = function () {
    var a = [
      {
        type: "number",
        rules: [
          { maximum: ["exclusiveMaximum"] },
          { minimum: ["exclusiveMinimum"] },
          "multipleOf",
          "format"
        ]
      },
      {
        type: "string",
        rules: ["maxLength", "minLength", "pattern", "format"]
      },
      {
        type: "array",
        rules: ["maxItems", "minItems", "items", "contains", "uniqueItems"]
      },
      {
        type: "object",
        rules: [
          "maxProperties",
          "minProperties",
          "required",
          "dependencies",
          "propertyNames",
          { properties: ["additionalProperties", "patternProperties"] }
        ]
      },
      { rules: ["$ref", "const", "enum", "not", "anyOf", "oneOf", "allOf", "if"] }
    ], t = ["type", "$comment"], n = [
      "$schema",
      "$id",
      "id",
      "$data",
      "$async",
      "title",
      "description",
      "default",
      "definitions",
      "examples",
      "readOnly",
      "writeOnly",
      "contentMediaType",
      "contentEncoding",
      "additionalItems",
      "then",
      "else"
    ], o = ["number", "integer", "string", "array", "object", "boolean", "null"];
    return a.all = e(t), a.types = e(o), a.forEach(function (i) {
      i.rules = i.rules.map(function (u) {
        var l;
        if (typeof u == "object") {
          var h = Object.keys(u)[0];
          l = u[h], u = h, l.forEach(function (p) {
            t.push(p), a.all[p] = !0;
          });
        }
        t.push(u);
        var f = a.all[u] = {
          keyword: u,
          code: s[u],
          implements: l
        };
        return f;
      }), a.all.$comment = {
        keyword: "$comment",
        code: s.$comment
      }, i.type && (a.types[i.type] = i);
    }), a.keywords = e(t.concat(n)), a.custom = {}, a;
  }, gs;
}
var vs, Di;
function sd() {
  if (Di) return vs;
  Di = 1;
  var s = [
    "multipleOf",
    "maximum",
    "exclusiveMaximum",
    "minimum",
    "exclusiveMinimum",
    "maxLength",
    "minLength",
    "pattern",
    "additionalItems",
    "maxItems",
    "minItems",
    "uniqueItems",
    "maxProperties",
    "minProperties",
    "required",
    "additionalProperties",
    "enum",
    "format",
    "const"
  ];
  return vs = function (e, r) {
    for (var a = 0; a < r.length; a++) {
      e = JSON.parse(JSON.stringify(e));
      var t = r[a].split("/"), n = e, o;
      for (o = 1; o < t.length; o++)
        n = n[t[o]];
      for (o = 0; o < s.length; o++) {
        var i = s[o], u = n[i];
        u && (n[i] = {
          anyOf: [
            u,
            { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" }
          ]
        });
      }
    }
    return e;
  }, vs;
}
var ys, Fi;
function nd() {
  if (Fi) return ys;
  Fi = 1;
  var s = _n().MissingRef;
  ys = e;
  function e(r, a, t) {
    var n = this;
    if (typeof this._opts.loadSchema != "function")
      throw new Error("options.loadSchema should be a function");
    typeof a == "function" && (t = a, a = void 0);
    var o = i(r).then(function () {
      var l = n._addSchema(r, void 0, a);
      return l.validate || u(l);
    });
    return t && o.then(
      function (l) {
        t(null, l);
      },
      t
    ), o;
    function i(l) {
      var h = l.$schema;
      return h && !n.getSchema(h) ? e.call(n, { $ref: h }, !0) : Promise.resolve();
    }
    function u(l) {
      try {
        return n._compile(l);
      } catch (f) {
        if (f instanceof s) return h(f);
        throw f;
      }
      function h(f) {
        var p = f.missingSchema;
        if (v(p)) throw new Error("Schema " + p + " is loaded but " + f.missingRef + " cannot be resolved");
        var d = n._loadingSchemas[p];
        return d || (d = n._loadingSchemas[p] = n._opts.loadSchema(p), d.then(g, g)), d.then(function (y) {
          if (!v(p))
            return i(y).then(function () {
              v(p) || n.addSchema(y, p, void 0, a);
            });
        }).then(function () {
          return u(l);
        });
        function g() {
          delete n._loadingSchemas[p];
        }
        function v(y) {
          return n._refs[y] || n._schemas[y];
        }
      }
    }
  }
  return ys;
}
var _s, Ni;
function id() {
  return Ni || (Ni = 1, _s = function (e, r, a) {
    var t = " ", n = e.level, o = e.dataLevel, i = e.schema[r], u = e.schemaPath + e.util.getProperty(r), l = e.errSchemaPath + "/" + r, h = !e.opts.allErrors, f, p = "data" + (o || ""), d = "valid" + n, g = "errs__" + n, v = e.opts.$data && i && i.$data, y;
    v ? (t += " var schema" + n + " = " + e.util.getData(i.$data, o, e.dataPathArr) + "; ", y = "schema" + n) : y = i;
    var _ = this, D = "definition" + n, O = _.definition, S = "", x, E, C, T, k;
    if (v && O.$data) {
      k = "keywordValidate" + n;
      var P = O.validateSchema;
      t += " var " + D + " = RULES.custom['" + r + "'].definition; var " + k + " = " + D + ".validate;";
    } else {
      if (T = e.useCustomRule(_, i, e.schema, e), !T) return;
      y = "validate.schema" + u, k = T.code, x = O.compile, E = O.inline, C = O.macro;
    }
    var R = k + ".errors", F = "i" + n, N = "ruleErr" + n, j = O.async;
    if (j && !e.async) throw new Error("async keyword in sync schema");
    if (E || C || (t += "" + R + " = null;"), t += "var " + g + " = errors;var " + d + ";", v && O.$data && (S += "}", t += " if (" + y + " === undefined) { " + d + " = true; } else { ", P && (S += "}", t += " " + d + " = " + D + ".validateSchema(" + y + "); if (" + d + ") { ")), E)
      O.statements ? t += " " + T.validate + " " : t += " " + d + " = " + T.validate + "; ";
    else if (C) {
      var V = e.util.copy(e), S = "";
      V.level++;
      var X = "valid" + V.level;
      V.schema = T.validate, V.schemaPath = "";
      var J = e.compositeRule;
      e.compositeRule = V.compositeRule = !0;
      var Y = e.validate(V).replace(/validate\.schema/g, k);
      e.compositeRule = V.compositeRule = J, t += " " + Y;
    } else {
      var te = te || [];
      te.push(t), t = "", t += "  " + k + ".call( ", e.opts.passContext ? t += "this" : t += "self", x || O.schema === !1 ? t += " , " + p + " " : t += " , " + y + " , " + p + " , validate.schema" + e.schemaPath + " ", t += " , (dataPath || '')", e.errorPath != '""' && (t += " + " + e.errorPath);
      var ne = o ? "data" + (o - 1 || "") : "parentData", Ze = o ? e.dataPathArr[o] : "parentDataProperty";
      t += " , " + ne + " , " + Ze + " , rootData )  ";
      var Ue = t;
      t = te.pop(), O.errors === !1 ? (t += " " + d + " = ", j && (t += "await "), t += "" + Ue + "; ") : j ? (R = "customErrors" + n, t += " var " + R + " = null; try { " + d + " = await " + Ue + "; } catch (e) { " + d + " = false; if (e instanceof ValidationError) " + R + " = e.errors; else throw e; } ") : t += " " + R + " = null; " + d + " = " + Ue + "; ";
    }
    if (O.modifying && (t += " if (" + ne + ") " + p + " = " + ne + "[" + Ze + "];"), t += "" + S, O.valid)
      h && (t += " if (true) { ");
    else {
      t += " if ( ", O.valid === void 0 ? (t += " !", C ? t += "" + X : t += "" + d) : t += " " + !O.valid + " ", t += ") { ", f = _.keyword;
      var te = te || [];
      te.push(t), t = "";
      var te = te || [];
      te.push(t), t = "", e.createErrors !== !1 ? (t += " { keyword: '" + (f || "custom") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { keyword: '" + _.keyword + "' } ", e.opts.messages !== !1 && (t += ` , message: 'should pass "` + _.keyword + `" keyword validation' `), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + p + " "), t += " } ") : t += " {} ";
      var je = t;
      t = te.pop(), !e.compositeRule && h ? e.async ? t += " throw new ValidationError([" + je + "]); " : t += " validate.errors = [" + je + "]; return false; " : t += " var err = " + je + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      var Te = t;
      t = te.pop(), E ? O.errors ? O.errors != "full" && (t += "  for (var " + F + "=" + g + "; " + F + "<errors; " + F + "++) { var " + N + " = vErrors[" + F + "]; if (" + N + ".dataPath === undefined) " + N + ".dataPath = (dataPath || '') + " + e.errorPath + "; if (" + N + ".schemaPath === undefined) { " + N + '.schemaPath = "' + l + '"; } ', e.opts.verbose && (t += " " + N + ".schema = " + y + "; " + N + ".data = " + p + "; "), t += " } ") : O.errors === !1 ? t += " " + Te + " " : (t += " if (" + g + " == errors) { " + Te + " } else {  for (var " + F + "=" + g + "; " + F + "<errors; " + F + "++) { var " + N + " = vErrors[" + F + "]; if (" + N + ".dataPath === undefined) " + N + ".dataPath = (dataPath || '') + " + e.errorPath + "; if (" + N + ".schemaPath === undefined) { " + N + '.schemaPath = "' + l + '"; } ', e.opts.verbose && (t += " " + N + ".schema = " + y + "; " + N + ".data = " + p + "; "), t += " } } ") : C ? (t += "   var err =   ", e.createErrors !== !1 ? (t += " { keyword: '" + (f || "custom") + "' , dataPath: (dataPath || '') + " + e.errorPath + " , schemaPath: " + e.util.toQuotedString(l) + " , params: { keyword: '" + _.keyword + "' } ", e.opts.messages !== !1 && (t += ` , message: 'should pass "` + _.keyword + `" keyword validation' `), e.opts.verbose && (t += " , schema: validate.schema" + u + " , parentSchema: validate.schema" + e.schemaPath + " , data: " + p + " "), t += " } ") : t += " {} ", t += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ", !e.compositeRule && h && (e.async ? t += " throw new ValidationError(vErrors); " : t += " validate.errors = vErrors; return false; ")) : O.errors === !1 ? t += " " + Te + " " : (t += " if (Array.isArray(" + R + ")) { if (vErrors === null) vErrors = " + R + "; else vErrors = vErrors.concat(" + R + "); errors = vErrors.length;  for (var " + F + "=" + g + "; " + F + "<errors; " + F + "++) { var " + N + " = vErrors[" + F + "]; if (" + N + ".dataPath === undefined) " + N + ".dataPath = (dataPath || '') + " + e.errorPath + ";  " + N + '.schemaPath = "' + l + '";  ', e.opts.verbose && (t += " " + N + ".schema = " + y + "; " + N + ".data = " + p + "; "), t += " } } else { " + Te + " } "), t += " } ", h && (t += " else { ");
    }
    return t;
  }), _s;
}
const od = "http://json-schema.org/draft-07/schema#", cd = "http://json-schema.org/draft-07/schema#", ld = "Core schema meta-schema", ud = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, dd = ["object", "boolean"], hd = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, No = {
  $schema: od,
  $id: cd,
  title: ld,
  definitions: ud,
  type: dd,
  properties: hd,
  default: !0
};
var bs, Mi;
function fd() {
  if (Mi) return bs;
  Mi = 1;
  var s = No;
  return bs = {
    $id: "https://github.com/ajv-validator/ajv/blob/master/lib/definition_schema.js",
    definitions: {
      simpleTypes: s.definitions.simpleTypes
    },
    type: "object",
    dependencies: {
      schema: ["validate"],
      $data: ["validate"],
      statements: ["inline"],
      valid: { not: { required: ["macro"] } }
    },
    properties: {
      type: s.properties.type,
      schema: { type: "boolean" },
      statements: { type: "boolean" },
      dependencies: {
        type: "array",
        items: { type: "string" }
      },
      metaSchema: { type: "object" },
      modifying: { type: "boolean" },
      valid: { type: "boolean" },
      $data: { type: "boolean" },
      async: { type: "boolean" },
      errors: {
        anyOf: [
          { type: "boolean" },
          { const: "full" }
        ]
      }
    }
  }, bs;
}
var ws, ji;
function pd() {
  if (ji) return ws;
  ji = 1;
  var s = /^[a-z_$][a-z0-9_$-]*$/i, e = id(), r = fd();
  ws = {
    add: a,
    get: t,
    remove: n,
    validate: o
  };
  function a(i, u) {
    var l = this.RULES;
    if (l.keywords[i])
      throw new Error("Keyword " + i + " is already defined");
    if (!s.test(i))
      throw new Error("Keyword " + i + " is not a valid identifier");
    if (u) {
      this.validateKeyword(u, !0);
      var h = u.type;
      if (Array.isArray(h))
        for (var f = 0; f < h.length; f++)
          d(i, h[f], u);
      else
        d(i, h, u);
      var p = u.metaSchema;
      p && (u.$data && this._opts.$data && (p = {
        anyOf: [
          p,
          { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" }
        ]
      }), u.validateSchema = this.compile(p, !0));
    }
    l.keywords[i] = l.all[i] = !0;
    function d(g, v, y) {
      for (var _, D = 0; D < l.length; D++) {
        var O = l[D];
        if (O.type == v) {
          _ = O;
          break;
        }
      }
      _ || (_ = { type: v, rules: [] }, l.push(_));
      var S = {
        keyword: g,
        definition: y,
        custom: !0,
        code: e,
        implements: y.implements
      };
      _.rules.push(S), l.custom[g] = S;
    }
    return this;
  }
  function t(i) {
    var u = this.RULES.custom[i];
    return u ? u.definition : this.RULES.keywords[i] || !1;
  }
  function n(i) {
    var u = this.RULES;
    delete u.keywords[i], delete u.all[i], delete u.custom[i];
    for (var l = 0; l < u.length; l++)
      for (var h = u[l].rules, f = 0; f < h.length; f++)
        if (h[f].keyword == i) {
          h.splice(f, 1);
          break;
        }
    return this;
  }
  function o(i, u) {
    o.errors = null;
    var l = this._validateKeyword = this._validateKeyword || this.compile(r, !0);
    if (l(i)) return !0;
    if (o.errors = l.errors, u)
      throw new Error("custom keyword definition is invalid: " + this.errorsText(l.errors));
    return !1;
  }
  return ws;
}
const md = "http://json-schema.org/draft-07/schema#", gd = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", vd = "Meta-schema for $data reference (JSON Schema extension proposal)", yd = "object", _d = ["$data"], bd = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, wd = !1, Ed = {
  $schema: md,
  $id: gd,
  description: vd,
  type: yd,
  required: _d,
  properties: bd,
  additionalProperties: wd
};
var Es, Li;
function Sd() {
  if (Li) return Es;
  Li = 1;
  var s = Du(), e = yn(), r = Fu(), a = Oo(), t = Do(), n = Nu(), o = ad(), i = sd(), u = wr();
  Es = g, g.prototype.validate = v, g.prototype.compile = y, g.prototype.addSchema = _, g.prototype.addMetaSchema = D, g.prototype.validateSchema = O, g.prototype.getSchema = x, g.prototype.removeSchema = T, g.prototype.addFormat = J, g.prototype.errorsText = X, g.prototype._addSchema = P, g.prototype._compile = R, g.prototype.compileAsync = nd();
  var l = pd();
  g.prototype.addKeyword = l.add, g.prototype.getKeyword = l.get, g.prototype.removeKeyword = l.remove, g.prototype.validateKeyword = l.validate;
  var h = _n();
  g.ValidationError = h.Validation, g.MissingRefError = h.MissingRef, g.$dataMetaSchema = i;
  var f = "http://json-schema.org/draft-07/schema", p = ["removeAdditional", "useDefaults", "coerceTypes", "strictDefaults"], d = ["/properties"];
  function g(A) {
    if (!(this instanceof g)) return new g(A);
    A = this._opts = u.copy(A) || {}, Te(this), this._schemas = {}, this._refs = {}, this._fragments = {}, this._formats = n(A.format), this._cache = A.cache || new r(), this._loadingSchemas = {}, this._compilations = [], this.RULES = o(), this._getId = F(A), A.loopRequired = A.loopRequired || 1 / 0, A.errorDataPath == "property" && (A._errorDataPathProperty = !0), A.serialize === void 0 && (A.serialize = t), this._metaOpts = je(this), A.formats && ne(this), A.keywords && Ze(this), Y(this), typeof A.meta == "object" && this.addMetaSchema(A.meta), A.nullable && this.addKeyword("nullable", { metaSchema: { type: "boolean" } }), te(this);
  }
  function v(A, M) {
    var Z;
    if (typeof A == "string") {
      if (Z = this.getSchema(A), !Z) throw new Error('no schema with key or ref "' + A + '"');
    } else {
      var se = this._addSchema(A);
      Z = se.validate || this._compile(se);
    }
    var L = Z(M);
    return Z.$async !== !0 && (this.errors = Z.errors), L;
  }
  function y(A, M) {
    var Z = this._addSchema(A, void 0, M);
    return Z.validate || this._compile(Z);
  }
  function _(A, M, Z, se) {
    if (Array.isArray(A)) {
      for (var L = 0; L < A.length; L++) this.addSchema(A[L], void 0, Z, se);
      return this;
    }
    var z = this._getId(A);
    if (z !== void 0 && typeof z != "string")
      throw new Error("schema id must be string");
    return M = e.normalizeId(M || z), Ue(this, M), this._schemas[M] = this._addSchema(A, Z, se, !0), this;
  }
  function D(A, M, Z) {
    return this.addSchema(A, M, Z, !0), this;
  }
  function O(A, M) {
    var Z = A.$schema;
    if (Z !== void 0 && typeof Z != "string")
      throw new Error("$schema must be a string");
    if (Z = Z || this._opts.defaultMeta || S(this), !Z)
      return this.logger.warn("meta-schema not available"), this.errors = null, !0;
    var se = this.validate(Z, A);
    if (!se && M) {
      var L = "schema is invalid: " + this.errorsText();
      if (this._opts.validateSchema == "log") this.logger.error(L);
      else throw new Error(L);
    }
    return se;
  }
  function S(A) {
    var M = A._opts.meta;
    return A._opts.defaultMeta = typeof M == "object" ? A._getId(M) || M : A.getSchema(f) ? f : void 0, A._opts.defaultMeta;
  }
  function x(A) {
    var M = C(this, A);
    switch (typeof M) {
      case "object":
        return M.validate || this._compile(M);
      case "string":
        return this.getSchema(M);
      case "undefined":
        return E(this, A);
    }
  }
  function E(A, M) {
    var Z = e.schema.call(A, { schema: {} }, M);
    if (Z) {
      var se = Z.schema, L = Z.root, z = Z.baseId, le = s.call(A, se, L, void 0, z);
      return A._fragments[M] = new a({
        ref: M,
        fragment: !0,
        schema: se,
        root: L,
        baseId: z,
        validate: le
      }), le;
    }
  }
  function C(A, M) {
    return M = e.normalizeId(M), A._schemas[M] || A._refs[M] || A._fragments[M];
  }
  function T(A) {
    if (A instanceof RegExp)
      return k(this, this._schemas, A), k(this, this._refs, A), this;
    switch (typeof A) {
      case "undefined":
        return k(this, this._schemas), k(this, this._refs), this._cache.clear(), this;
      case "string":
        var M = C(this, A);
        return M && this._cache.del(M.cacheKey), delete this._schemas[A], delete this._refs[A], this;
      case "object":
        var Z = this._opts.serialize, se = Z ? Z(A) : A;
        this._cache.del(se);
        var L = this._getId(A);
        L && (L = e.normalizeId(L), delete this._schemas[L], delete this._refs[L]);
    }
    return this;
  }
  function k(A, M, Z) {
    for (var se in M) {
      var L = M[se];
      !L.meta && (!Z || Z.test(se)) && (A._cache.del(L.cacheKey), delete M[se]);
    }
  }
  function P(A, M, Z, se) {
    if (typeof A != "object" && typeof A != "boolean")
      throw new Error("schema should be object or boolean");
    var L = this._opts.serialize, z = L ? L(A) : A, le = this._cache.get(z);
    if (le) return le;
    se = se || this._opts.addUsedSchema !== !1;
    var fe = e.normalizeId(this._getId(A));
    fe && se && Ue(this, fe);
    var de = this._opts.validateSchema !== !1 && !M, we;
    de && !(we = fe && fe == e.normalizeId(A.$schema)) && this.validateSchema(A, !0);
    var ve = e.ids.call(this, A), ye = new a({
      id: fe,
      schema: A,
      localRefs: ve,
      cacheKey: z,
      meta: Z
    });
    return fe[0] != "#" && se && (this._refs[fe] = ye), this._cache.put(z, ye), de && we && this.validateSchema(A, !0), ye;
  }
  function R(A, M) {
    if (A.compiling)
      return A.validate = L, L.schema = A.schema, L.errors = null, L.root = M || L, A.schema.$async === !0 && (L.$async = !0), L;
    A.compiling = !0;
    var Z;
    A.meta && (Z = this._opts, this._opts = this._metaOpts);
    var se;
    try {
      se = s.call(this, A.schema, M, A.localRefs);
    } catch (z) {
      throw delete A.validate, z;
    } finally {
      A.compiling = !1, A.meta && (this._opts = Z);
    }
    return A.validate = se, A.refs = se.refs, A.refVal = se.refVal, A.root = se.root, se;
    function L() {
      var z = A.validate, le = z.apply(this, arguments);
      return L.errors = z.errors, le;
    }
  }
  function F(A) {
    switch (A.schemaId) {
      case "auto":
        return V;
      case "id":
        return N;
      default:
        return j;
    }
  }
  function N(A) {
    return A.$id && this.logger.warn("schema $id ignored", A.$id), A.id;
  }
  function j(A) {
    return A.id && this.logger.warn("schema id ignored", A.id), A.$id;
  }
  function V(A) {
    if (A.$id && A.id && A.$id != A.id)
      throw new Error("schema $id is different from id");
    return A.$id || A.id;
  }
  function X(A, M) {
    if (A = A || this.errors, !A) return "No errors";
    M = M || {};
    for (var Z = M.separator === void 0 ? ", " : M.separator, se = M.dataVar === void 0 ? "data" : M.dataVar, L = "", z = 0; z < A.length; z++) {
      var le = A[z];
      le && (L += se + le.dataPath + " " + le.message + Z);
    }
    return L.slice(0, -Z.length);
  }
  function J(A, M) {
    return typeof M == "string" && (M = new RegExp(M)), this._formats[A] = M, this;
  }
  function Y(A) {
    var M;
    if (A._opts.$data && (M = Ed, A.addMetaSchema(M, M.$id, !0)), A._opts.meta !== !1) {
      var Z = No;
      A._opts.$data && (Z = i(Z, d)), A.addMetaSchema(Z, f, !0), A._refs["http://json-schema.org/schema"] = f;
    }
  }
  function te(A) {
    var M = A._opts.schemas;
    if (M)
      if (Array.isArray(M)) A.addSchema(M);
      else for (var Z in M) A.addSchema(M[Z], Z);
  }
  function ne(A) {
    for (var M in A._opts.formats) {
      var Z = A._opts.formats[M];
      A.addFormat(M, Z);
    }
  }
  function Ze(A) {
    for (var M in A._opts.keywords) {
      var Z = A._opts.keywords[M];
      A.addKeyword(M, Z);
    }
  }
  function Ue(A, M) {
    if (A._schemas[M] || A._refs[M])
      throw new Error('schema with key or id "' + M + '" already exists');
  }
  function je(A) {
    for (var M = u.copy(A._opts), Z = 0; Z < p.length; Z++)
      delete M[p[Z]];
    return M;
  }
  function Te(A) {
    var M = A._opts.logger;
    if (M === !1)
      A.logger = { log: nt, warn: nt, error: nt };
    else {
      if (M === void 0 && (M = console), !(typeof M == "object" && M.log && M.warn && M.error))
        throw new Error("logger must implement log, warn and error methods");
      A.logger = M;
    }
  }
  function nt() {
  }
  return Es;
}
var Pd = Sd();
const Cd = /* @__PURE__ */ hc(Pd);
class xd extends Ru {
  /**
   * Initializes this client with the given name and version information.
   */
  constructor(e, r) {
    var a;
    super(r), this._clientInfo = e, this._cachedToolOutputValidators = /* @__PURE__ */ new Map(), this._capabilities = (a = r == null ? void 0 : r.capabilities) !== null && a !== void 0 ? a : {}, this._ajv = new Cd();
  }
  /**
   * Registers new capabilities. This can only be called before connecting to a transport.
   *
   * The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
   */
  registerCapabilities(e) {
    if (this.transport)
      throw new Error("Cannot register capabilities after connecting to transport");
    this._capabilities = Tu(this._capabilities, e);
  }
  assertCapability(e, r) {
    var a;
    if (!(!((a = this._serverCapabilities) === null || a === void 0) && a[e]))
      throw new Error(`Server does not support ${e} (required for ${r})`);
  }
  async connect(e, r) {
    if (await super.connect(e), e.sessionId === void 0)
      try {
        const a = await this.request({
          method: "initialize",
          params: {
            protocolVersion: Ea,
            capabilities: this._capabilities,
            clientInfo: this._clientInfo
          }
        }, vo, r);
        if (a === void 0)
          throw new Error(`Server sent invalid initialize result: ${a}`);
        if (!kl.includes(a.protocolVersion))
          throw new Error(`Server's protocol version is not supported: ${a.protocolVersion}`);
        this._serverCapabilities = a.capabilities, this._serverVersion = a.serverInfo, e.setProtocolVersion && e.setProtocolVersion(a.protocolVersion), this._instructions = a.instructions, await this.notification({
          method: "notifications/initialized"
        });
      } catch (a) {
        throw this.close(), a;
      }
  }
  /**
   * After initialization has completed, this will be populated with the server's reported capabilities.
   */
  getServerCapabilities() {
    return this._serverCapabilities;
  }
  /**
   * After initialization has completed, this will be populated with information about the server's name and version.
   */
  getServerVersion() {
    return this._serverVersion;
  }
  /**
   * After initialization has completed, this may be populated with information about the server's instructions.
   */
  getInstructions() {
    return this._instructions;
  }
  assertCapabilityForMethod(e) {
    var r, a, t, n, o;
    switch (e) {
      case "logging/setLevel":
        if (!(!((r = this._serverCapabilities) === null || r === void 0) && r.logging))
          throw new Error(`Server does not support logging (required for ${e})`);
        break;
      case "prompts/get":
      case "prompts/list":
        if (!(!((a = this._serverCapabilities) === null || a === void 0) && a.prompts))
          throw new Error(`Server does not support prompts (required for ${e})`);
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
      case "resources/subscribe":
      case "resources/unsubscribe":
        if (!(!((t = this._serverCapabilities) === null || t === void 0) && t.resources))
          throw new Error(`Server does not support resources (required for ${e})`);
        if (e === "resources/subscribe" && !this._serverCapabilities.resources.subscribe)
          throw new Error(`Server does not support resource subscriptions (required for ${e})`);
        break;
      case "tools/call":
      case "tools/list":
        if (!(!((n = this._serverCapabilities) === null || n === void 0) && n.tools))
          throw new Error(`Server does not support tools (required for ${e})`);
        break;
      case "completion/complete":
        if (!(!((o = this._serverCapabilities) === null || o === void 0) && o.completions))
          throw new Error(`Server does not support completions (required for ${e})`);
        break;
    }
  }
  assertNotificationCapability(e) {
    var r;
    switch (e) {
      case "notifications/roots/list_changed":
        if (!(!((r = this._capabilities.roots) === null || r === void 0) && r.listChanged))
          throw new Error(`Client does not support roots list changed notifications (required for ${e})`);
        break;
    }
  }
  assertRequestHandlerCapability(e) {
    switch (e) {
      case "sampling/createMessage":
        if (!this._capabilities.sampling)
          throw new Error(`Client does not support sampling capability (required for ${e})`);
        break;
      case "elicitation/create":
        if (!this._capabilities.elicitation)
          throw new Error(`Client does not support elicitation capability (required for ${e})`);
        break;
      case "roots/list":
        if (!this._capabilities.roots)
          throw new Error(`Client does not support roots capability (required for ${e})`);
        break;
    }
  }
  async ping(e) {
    return this.request({ method: "ping" }, ur, e);
  }
  async complete(e, r) {
    return this.request({ method: "completion/complete", params: e }, $o, r);
  }
  async setLoggingLevel(e, r) {
    return this.request({ method: "logging/setLevel", params: { level: e } }, ur, r);
  }
  async getPrompt(e, r) {
    return this.request({ method: "prompts/get", params: e }, Ro, r);
  }
  async listPrompts(e, r) {
    return this.request({ method: "prompts/list", params: e }, xo, r);
  }
  async listResources(e, r) {
    return this.request({ method: "resources/list", params: e }, So, r);
  }
  async listResourceTemplates(e, r) {
    return this.request({ method: "resources/templates/list", params: e }, Po, r);
  }
  async readResource(e, r) {
    return this.request({ method: "resources/read", params: e }, Co, r);
  }
  async subscribeResource(e, r) {
    return this.request({ method: "resources/subscribe", params: e }, ur, r);
  }
  async unsubscribeResource(e, r) {
    return this.request({ method: "resources/unsubscribe", params: e }, ur, r);
  }
  async callTool(e, r = gn, a) {
    const t = await this.request({ method: "tools/call", params: e }, r, a), n = this.getToolOutputValidator(e.name);
    if (n) {
      if (!t.structuredContent && !t.isError)
        throw new jt(wt.InvalidRequest, `Tool ${e.name} has an output schema but did not return structured content`);
      if (t.structuredContent)
        try {
          if (!n(t.structuredContent))
            throw new jt(wt.InvalidParams, `Structured content does not match the tool's output schema: ${this._ajv.errorsText(n.errors)}`);
        } catch (o) {
          throw o instanceof jt ? o : new jt(wt.InvalidParams, `Failed to validate structured content: ${o instanceof Error ? o.message : String(o)}`);
        }
    }
    return t;
  }
  cacheToolOutputSchemas(e) {
    this._cachedToolOutputValidators.clear();
    for (const r of e)
      if (r.outputSchema)
        try {
          const a = this._ajv.compile(r.outputSchema);
          this._cachedToolOutputValidators.set(r.name, a);
        } catch {
        }
  }
  getToolOutputValidator(e) {
    return this._cachedToolOutputValidators.get(e);
  }
  async listTools(e, r) {
    const a = await this.request({ method: "tools/list", params: e }, To, r);
    return this.cacheToolOutputSchemas(a.tools), a;
  }
  async sendRootsListChanged() {
    return this.notification({ method: "notifications/roots/list_changed" });
  }
}
const Ui = st("EventEmitter");
class Mo {
  constructor() {
    B(this, "listeners", /* @__PURE__ */ new Map());
    B(this, "maxListeners", 100);
  }
  on(e, r) {
    this.listeners.has(e) || this.listeners.set(e, /* @__PURE__ */ new Set());
    const a = this.listeners.get(e);
    return a.size >= this.maxListeners && Ui.warn(`EventEmitter: Maximum listeners (${this.maxListeners}) exceeded for event '${String(e)}'`), a.add(r), this;
  }
  off(e, r) {
    const a = this.listeners.get(e);
    return a && (a.delete(r), a.size === 0 && this.listeners.delete(e)), this;
  }
  once(e, r) {
    const a = (t) => (this.off(e, a), r(t));
    return this.on(e, a);
  }
  emit(e, r) {
    const a = this.listeners.get(e);
    return !a || a.size === 0 ? !1 : (a.forEach(async (t) => {
      try {
        await t(r);
      } catch (n) {
        Ui.error(`EventEmitter: Error in listener for event '${String(e)}':`, n);
      }
    }), !0);
  }
  removeAllListeners(e) {
    return e !== void 0 ? this.listeners.delete(e) : this.listeners.clear(), this;
  }
  listenerCount(e) {
    var r;
    return ((r = this.listeners.get(e)) == null ? void 0 : r.size) ?? 0;
  }
  eventNames() {
    return Array.from(this.listeners.keys());
  }
  setMaxListeners(e) {
    return this.maxListeners = Math.max(0, e), this;
  }
  getMaxListeners() {
    return this.maxListeners;
  }
}
class qi extends Error {
  constructor(e, r) {
    super(e), this.name = "ParseError", this.type = r.type, this.field = r.field, this.value = r.value, this.line = r.line;
  }
}
function Ss(s) {
}
function jo(s) {
  if (typeof s == "function")
    throw new TypeError(
      "`callbacks` must be an object, got a function instead. Did you mean `{onEvent: fn}`?"
    );
  const { onEvent: e = Ss, onError: r = Ss, onRetry: a = Ss, onComment: t } = s;
  let n = "", o = !0, i, u = "", l = "";
  function h(v) {
    const y = o ? v.replace(/^\xEF\xBB\xBF/, "") : v, [_, D] = Ad(`${n}${y}`);
    for (const O of _)
      f(O);
    n = D, o = !1;
  }
  function f(v) {
    if (v === "") {
      d();
      return;
    }
    if (v.startsWith(":")) {
      t && t(v.slice(v.startsWith(": ") ? 2 : 1));
      return;
    }
    const y = v.indexOf(":");
    if (y !== -1) {
      const _ = v.slice(0, y), D = v[y + 1] === " " ? 2 : 1, O = v.slice(y + D);
      p(_, O, v);
      return;
    }
    p(v, "", v);
  }
  function p(v, y, _) {
    switch (v) {
      case "event":
        l = y;
        break;
      case "data":
        u = `${u}${y}
`;
        break;
      case "id":
        i = y.includes("\0") ? void 0 : y;
        break;
      case "retry":
        /^\d+$/.test(y) ? a(parseInt(y, 10)) : r(
          new qi(`Invalid \`retry\` value: "${y}"`, {
            type: "invalid-retry",
            value: y,
            line: _
          })
        );
        break;
      default:
        r(
          new qi(
            `Unknown field "${v.length > 20 ? `${v.slice(0, 20)}…` : v}"`,
            { type: "unknown-field", field: v, value: y, line: _ }
          )
        );
        break;
    }
  }
  function d() {
    u.length > 0 && e({
      id: i,
      event: l || void 0,
      // If the data buffer's last character is a U+000A LINE FEED (LF) character,
      // then remove the last character from the data buffer.
      data: u.endsWith(`
`) ? u.slice(0, -1) : u
    }), i = void 0, u = "", l = "";
  }
  function g(v = {}) {
    n && v.consume && f(n), o = !0, i = void 0, u = "", l = "", n = "";
  }
  return { feed: h, reset: g };
}
function Ad(s) {
  const e = [];
  let r = "", a = 0;
  for (; a < s.length;) {
    const t = s.indexOf("\r", a), n = s.indexOf(`
`, a);
    let o = -1;
    if (t !== -1 && n !== -1 ? o = Math.min(t, n) : t !== -1 ? o = t : n !== -1 && (o = n), o === -1) {
      r = s.slice(a);
      break;
    } else {
      const i = s.slice(a, o);
      e.push(i), a = o + 1, s[a - 1] === "\r" && s[a] === `
` && a++;
    }
  }
  return [e, r];
}
class zi extends Event {
  /**
   * Constructs a new `ErrorEvent` instance. This is typically not called directly,
   * but rather emitted by the `EventSource` object when an error occurs.
   *
   * @param type - The type of the event (should be "error")
   * @param errorEventInitDict - Optional properties to include in the error event
   */
  constructor(e, r) {
    var a, t;
    super(e), this.code = (a = r == null ? void 0 : r.code) != null ? a : void 0, this.message = (t = r == null ? void 0 : r.message) != null ? t : void 0;
  }
  /**
   * Node.js "hides" the `message` and `code` properties of the `ErrorEvent` instance,
   * when it is `console.log`'ed. This makes it harder to debug errors. To ease debugging,
   * we explicitly include the properties in the `inspect` method.
   *
   * This is automatically called by Node.js when you `console.log` an instance of this class.
   *
   * @param _depth - The current depth
   * @param options - The options passed to `util.inspect`
   * @param inspect - The inspect function to use (prevents having to import it from `util`)
   * @returns A string representation of the error
   */
  [Symbol.for("nodejs.util.inspect.custom")](e, r, a) {
    return a(Vi(this), r);
  }
  /**
   * Deno "hides" the `message` and `code` properties of the `ErrorEvent` instance,
   * when it is `console.log`'ed. This makes it harder to debug errors. To ease debugging,
   * we explicitly include the properties in the `inspect` method.
   *
   * This is automatically called by Deno when you `console.log` an instance of this class.
   *
   * @param inspect - The inspect function to use (prevents having to import it from `util`)
   * @param options - The options passed to `Deno.inspect`
   * @returns A string representation of the error
   */
  [Symbol.for("Deno.customInspect")](e, r) {
    return e(Vi(this), r);
  }
}
function Rd(s) {
  const e = globalThis.DOMException;
  return typeof e == "function" ? new e(s, "SyntaxError") : new SyntaxError(s);
}
function Fs(s) {
  return s instanceof Error ? "errors" in s && Array.isArray(s.errors) ? s.errors.map(Fs).join(", ") : "cause" in s && s.cause instanceof Error ? `${s}: ${Fs(s.cause)}` : s.message : `${s}`;
}
function Vi(s) {
  return {
    type: s.type,
    message: s.message,
    code: s.code,
    defaultPrevented: s.defaultPrevented,
    cancelable: s.cancelable,
    timeStamp: s.timeStamp
  };
}
var Lo = (s) => {
  throw TypeError(s);
}, bn = (s, e, r) => e.has(s) || Lo("Cannot " + r), he = (s, e, r) => (bn(s, e, "read from private field"), r ? r.call(s) : e.get(s)), Fe = (s, e, r) => e.has(s) ? Lo("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(s) : e.set(s, r), Pe = (s, e, r, a) => (bn(s, e, "write to private field"), e.set(s, r), r), It = (s, e, r) => (bn(s, e, "access private method"), r), tt, Qt, ir, oa, ga, Ir, dr, $r, Mt, or, fr, cr, Tr, ht, Ns, Ms, js, Hi, Ls, Us, kr, qs, zs;
class ca extends EventTarget {
  constructor(e, r) {
    var a, t;
    super(), Fe(this, ht), this.CONNECTING = 0, this.OPEN = 1, this.CLOSED = 2, Fe(this, tt), Fe(this, Qt), Fe(this, ir), Fe(this, oa), Fe(this, ga), Fe(this, Ir), Fe(this, dr), Fe(this, $r, null), Fe(this, Mt), Fe(this, or), Fe(this, fr, null), Fe(this, cr, null), Fe(this, Tr, null), Fe(this, Ms, async (n) => {
      var o;
      he(this, or).reset();
      const { body: i, redirected: u, status: l, headers: h } = n;
      if (l === 204) {
        It(this, ht, kr).call(this, "Server sent HTTP 204, not reconnecting", 204), this.close();
        return;
      }
      if (u ? Pe(this, ir, new URL(n.url)) : Pe(this, ir, void 0), l !== 200) {
        It(this, ht, kr).call(this, `Non-200 status code (${l})`, l);
        return;
      }
      if (!(h.get("content-type") || "").startsWith("text/event-stream")) {
        It(this, ht, kr).call(this, 'Invalid content type, expected "text/event-stream"', l);
        return;
      }
      if (he(this, tt) === this.CLOSED)
        return;
      Pe(this, tt, this.OPEN);
      const f = new Event("open");
      if ((o = he(this, Tr)) == null || o.call(this, f), this.dispatchEvent(f), typeof i != "object" || !i || !("getReader" in i)) {
        It(this, ht, kr).call(this, "Invalid response body, expected a web ReadableStream", l), this.close();
        return;
      }
      const p = new TextDecoder(), d = i.getReader();
      let g = !0;
      do {
        const { done: v, value: y } = await d.read();
        y && he(this, or).feed(p.decode(y, { stream: !v })), v && (g = !1, he(this, or).reset(), It(this, ht, qs).call(this));
      } while (g);
    }), Fe(this, js, (n) => {
      Pe(this, Mt, void 0), !(n.name === "AbortError" || n.type === "aborted") && It(this, ht, qs).call(this, Fs(n));
    }), Fe(this, Ls, (n) => {
      typeof n.id == "string" && Pe(this, $r, n.id);
      const o = new MessageEvent(n.event || "message", {
        data: n.data,
        origin: he(this, ir) ? he(this, ir).origin : he(this, Qt).origin,
        lastEventId: n.id || ""
      });
      he(this, cr) && (!n.event || n.event === "message") && he(this, cr).call(this, o), this.dispatchEvent(o);
    }), Fe(this, Us, (n) => {
      Pe(this, Ir, n);
    }), Fe(this, zs, () => {
      Pe(this, dr, void 0), he(this, tt) === this.CONNECTING && It(this, ht, Ns).call(this);
    });
    try {
      if (e instanceof URL)
        Pe(this, Qt, e);
      else if (typeof e == "string")
        Pe(this, Qt, new URL(e, Td()));
      else
        throw new Error("Invalid URL");
    } catch {
      throw Rd("An invalid or illegal string was specified");
    }
    Pe(this, or, jo({
      onEvent: he(this, Ls),
      onRetry: he(this, Us)
    })), Pe(this, tt, this.CONNECTING), Pe(this, Ir, 3e3), Pe(this, ga, (a = r == null ? void 0 : r.fetch) != null ? a : globalThis.fetch), Pe(this, oa, (t = r == null ? void 0 : r.withCredentials) != null ? t : !1), It(this, ht, Ns).call(this);
  }
  /**
   * Returns the state of this EventSource object's connection. It can have the values described below.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/readyState)
   *
   * Note: typed as `number` instead of `0 | 1 | 2` for compatibility with the `EventSource` interface,
   * defined in the TypeScript `dom` library.
   *
   * @public
   */
  get readyState() {
    return he(this, tt);
  }
  /**
   * Returns the URL providing the event stream.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/url)
   *
   * @public
   */
  get url() {
    return he(this, Qt).href;
  }
  /**
   * Returns true if the credentials mode for connection requests to the URL providing the event stream is set to "include", and false otherwise.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/withCredentials)
   */
  get withCredentials() {
    return he(this, oa);
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/error_event) */
  get onerror() {
    return he(this, fr);
  }
  set onerror(e) {
    Pe(this, fr, e);
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/message_event) */
  get onmessage() {
    return he(this, cr);
  }
  set onmessage(e) {
    Pe(this, cr, e);
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/open_event) */
  get onopen() {
    return he(this, Tr);
  }
  set onopen(e) {
    Pe(this, Tr, e);
  }
  addEventListener(e, r, a) {
    const t = r;
    super.addEventListener(e, t, a);
  }
  removeEventListener(e, r, a) {
    const t = r;
    super.removeEventListener(e, t, a);
  }
  /**
   * Aborts any instances of the fetch algorithm started for this EventSource object, and sets the readyState attribute to CLOSED.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/close)
   *
   * @public
   */
  close() {
    he(this, dr) && clearTimeout(he(this, dr)), he(this, tt) !== this.CLOSED && (he(this, Mt) && he(this, Mt).abort(), Pe(this, tt, this.CLOSED), Pe(this, Mt, void 0));
  }
}
tt = /* @__PURE__ */ new WeakMap(), Qt = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), oa = /* @__PURE__ */ new WeakMap(), ga = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), dr = /* @__PURE__ */ new WeakMap(), $r = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), or = /* @__PURE__ */ new WeakMap(), fr = /* @__PURE__ */ new WeakMap(), cr = /* @__PURE__ */ new WeakMap(), Tr = /* @__PURE__ */ new WeakMap(), ht = /* @__PURE__ */ new WeakSet(), /**
* Connect to the given URL and start receiving events
*
* @internal
*/
  Ns = function () {
    Pe(this, tt, this.CONNECTING), Pe(this, Mt, new AbortController()), he(this, ga)(he(this, Qt), It(this, ht, Hi).call(this)).then(he(this, Ms)).catch(he(this, js));
  }, Ms = /* @__PURE__ */ new WeakMap(), js = /* @__PURE__ */ new WeakMap(), /**
* Get request options for the `fetch()` request
*
* @returns The request options
* @internal
*/
  Hi = function () {
    var s;
    const e = {
      // [spec] Let `corsAttributeState` be `Anonymous`…
      // [spec] …will have their mode set to "cors"…
      mode: "cors",
      redirect: "follow",
      headers: { Accept: "text/event-stream", ...he(this, $r) ? { "Last-Event-ID": he(this, $r) } : void 0 },
      cache: "no-store",
      signal: (s = he(this, Mt)) == null ? void 0 : s.signal
    };
    return "window" in globalThis && (e.credentials = this.withCredentials ? "include" : "same-origin"), e;
  }, Ls = /* @__PURE__ */ new WeakMap(), Us = /* @__PURE__ */ new WeakMap(), /**
* Handles the process referred to in the EventSource specification as "failing a connection".
*
* @param error - The error causing the connection to fail
* @param code - The HTTP status code, if available
* @internal
*/
  kr = function (s, e) {
    var r;
    he(this, tt) !== this.CLOSED && Pe(this, tt, this.CLOSED);
    const a = new zi("error", { code: e, message: s });
    (r = he(this, fr)) == null || r.call(this, a), this.dispatchEvent(a);
  }, /**
* Schedules a reconnection attempt against the EventSource endpoint.
*
* @param message - The error causing the connection to fail
* @param code - The HTTP status code, if available
* @internal
*/
  qs = function (s, e) {
    var r;
    if (he(this, tt) === this.CLOSED)
      return;
    Pe(this, tt, this.CONNECTING);
    const a = new zi("error", { code: e, message: s });
    (r = he(this, fr)) == null || r.call(this, a), this.dispatchEvent(a), Pe(this, dr, setTimeout(he(this, zs), he(this, Ir)));
  }, zs = /* @__PURE__ */ new WeakMap(), /**
* ReadyState representing an EventSource currently trying to connect
*
* @public
*/
  ca.CONNECTING = 0, /**
* ReadyState representing an EventSource connection that is open (eg connected)
*
* @public
*/
  ca.OPEN = 1, /**
* ReadyState representing an EventSource connection that is closed (eg disconnected)
*
* @public
*/
  ca.CLOSED = 2;
function Td() {
  const s = "document" in globalThis ? globalThis.document : void 0;
  return s && typeof s == "object" && "baseURI" in s && typeof s.baseURI == "string" ? s.baseURI : void 0;
}
let wn;
wn = globalThis.crypto;
async function kd(s) {
  return (await wn).getRandomValues(new Uint8Array(s));
}
async function Id(s) {
  const e = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  let r = "";
  const a = await kd(s);
  for (let t = 0; t < s; t++) {
    const n = a[t] % e.length;
    r += e[n];
  }
  return r;
}
async function $d(s) {
  return await Id(s);
}
async function Od(s) {
  const e = await (await wn).subtle.digest("SHA-256", new TextEncoder().encode(s));
  return btoa(String.fromCharCode(...new Uint8Array(e))).replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "");
}
async function Dd(s) {
  if (s || (s = 43), s < 43 || s > 128)
    throw `Expected a length between 43 and 128. Received ${s}.`;
  const e = await $d(s), r = await Od(e);
  return {
    code_verifier: e,
    code_challenge: r
  };
}
const ze = c.string().url().superRefine((s, e) => {
  if (!URL.canParse(s))
    return e.addIssue({
      code: c.ZodIssueCode.custom,
      message: "URL must be parseable",
      fatal: !0
    }), c.NEVER;
}).refine((s) => {
  const e = new URL(s);
  return e.protocol !== "javascript:" && e.protocol !== "data:" && e.protocol !== "vbscript:";
}, { message: "URL cannot use javascript:, data:, or vbscript: scheme" }), Fd = c.object({
  resource: c.string().url(),
  authorization_servers: c.array(ze).optional(),
  jwks_uri: c.string().url().optional(),
  scopes_supported: c.array(c.string()).optional(),
  bearer_methods_supported: c.array(c.string()).optional(),
  resource_signing_alg_values_supported: c.array(c.string()).optional(),
  resource_name: c.string().optional(),
  resource_documentation: c.string().optional(),
  resource_policy_uri: c.string().url().optional(),
  resource_tos_uri: c.string().url().optional(),
  tls_client_certificate_bound_access_tokens: c.boolean().optional(),
  authorization_details_types_supported: c.array(c.string()).optional(),
  dpop_signing_alg_values_supported: c.array(c.string()).optional(),
  dpop_bound_access_tokens_required: c.boolean().optional()
}).passthrough(), Uo = c.object({
  issuer: c.string(),
  authorization_endpoint: ze,
  token_endpoint: ze,
  registration_endpoint: ze.optional(),
  scopes_supported: c.array(c.string()).optional(),
  response_types_supported: c.array(c.string()),
  response_modes_supported: c.array(c.string()).optional(),
  grant_types_supported: c.array(c.string()).optional(),
  token_endpoint_auth_methods_supported: c.array(c.string()).optional(),
  token_endpoint_auth_signing_alg_values_supported: c.array(c.string()).optional(),
  service_documentation: ze.optional(),
  revocation_endpoint: ze.optional(),
  revocation_endpoint_auth_methods_supported: c.array(c.string()).optional(),
  revocation_endpoint_auth_signing_alg_values_supported: c.array(c.string()).optional(),
  introspection_endpoint: c.string().optional(),
  introspection_endpoint_auth_methods_supported: c.array(c.string()).optional(),
  introspection_endpoint_auth_signing_alg_values_supported: c.array(c.string()).optional(),
  code_challenge_methods_supported: c.array(c.string()).optional()
}).passthrough(), Nd = c.object({
  issuer: c.string(),
  authorization_endpoint: ze,
  token_endpoint: ze,
  userinfo_endpoint: ze.optional(),
  jwks_uri: ze,
  registration_endpoint: ze.optional(),
  scopes_supported: c.array(c.string()).optional(),
  response_types_supported: c.array(c.string()),
  response_modes_supported: c.array(c.string()).optional(),
  grant_types_supported: c.array(c.string()).optional(),
  acr_values_supported: c.array(c.string()).optional(),
  subject_types_supported: c.array(c.string()),
  id_token_signing_alg_values_supported: c.array(c.string()),
  id_token_encryption_alg_values_supported: c.array(c.string()).optional(),
  id_token_encryption_enc_values_supported: c.array(c.string()).optional(),
  userinfo_signing_alg_values_supported: c.array(c.string()).optional(),
  userinfo_encryption_alg_values_supported: c.array(c.string()).optional(),
  userinfo_encryption_enc_values_supported: c.array(c.string()).optional(),
  request_object_signing_alg_values_supported: c.array(c.string()).optional(),
  request_object_encryption_alg_values_supported: c.array(c.string()).optional(),
  request_object_encryption_enc_values_supported: c.array(c.string()).optional(),
  token_endpoint_auth_methods_supported: c.array(c.string()).optional(),
  token_endpoint_auth_signing_alg_values_supported: c.array(c.string()).optional(),
  display_values_supported: c.array(c.string()).optional(),
  claim_types_supported: c.array(c.string()).optional(),
  claims_supported: c.array(c.string()).optional(),
  service_documentation: c.string().optional(),
  claims_locales_supported: c.array(c.string()).optional(),
  ui_locales_supported: c.array(c.string()).optional(),
  claims_parameter_supported: c.boolean().optional(),
  request_parameter_supported: c.boolean().optional(),
  request_uri_parameter_supported: c.boolean().optional(),
  require_request_uri_registration: c.boolean().optional(),
  op_policy_uri: ze.optional(),
  op_tos_uri: ze.optional()
}).passthrough(), Md = Nd.merge(Uo.pick({
  code_challenge_methods_supported: !0
})), qo = c.object({
  access_token: c.string(),
  id_token: c.string().optional(),
  // Optional for OAuth 2.1, but necessary in OpenID Connect
  token_type: c.string(),
  expires_in: c.number().optional(),
  scope: c.string().optional(),
  refresh_token: c.string().optional()
}).strip(), jd = c.object({
  error: c.string(),
  error_description: c.string().optional(),
  error_uri: c.string().optional()
}), Bi = ze.optional().or(c.literal("").transform(() => {
})), Ld = c.object({
  redirect_uris: c.array(ze),
  token_endpoint_auth_method: c.string().optional(),
  grant_types: c.array(c.string()).optional(),
  response_types: c.array(c.string()).optional(),
  client_name: c.string().optional(),
  client_uri: ze.optional(),
  logo_uri: Bi,
  scope: c.string().optional(),
  contacts: c.array(c.string()).optional(),
  tos_uri: Bi,
  policy_uri: c.string().optional(),
  jwks_uri: ze.optional(),
  jwks: c.any().optional(),
  software_id: c.string().optional(),
  software_version: c.string().optional(),
  software_statement: c.string().optional()
}).strip(), Ud = c.object({
  client_id: c.string(),
  client_secret: c.string().optional(),
  client_id_issued_at: c.number().optional(),
  client_secret_expires_at: c.number().optional()
}).strip(), qd = Ld.merge(Ud);
c.object({
  error: c.string(),
  error_description: c.string().optional()
}).strip();
c.object({
  token: c.string(),
  token_type_hint: c.string().optional()
}).strip();
function zd(s) {
  const e = typeof s == "string" ? new URL(s) : new URL(s.href);
  return e.hash = "", e;
}
function Vd({ requestedResource: s, configuredResource: e }) {
  const r = typeof s == "string" ? new URL(s) : new URL(s.href), a = typeof e == "string" ? new URL(e) : new URL(e.href);
  if (r.origin !== a.origin || r.pathname.length < a.pathname.length)
    return !1;
  const t = r.pathname.endsWith("/") ? r.pathname : r.pathname + "/", n = a.pathname.endsWith("/") ? a.pathname : a.pathname + "/";
  return t.startsWith(n);
}
class Ve extends Error {
  constructor(e, r) {
    super(e), this.errorUri = r, this.name = this.constructor.name;
  }
  /**
   * Converts the error to a standard OAuth error response object
   */
  toResponseObject() {
    const e = {
      error: this.errorCode,
      error_description: this.message
    };
    return this.errorUri && (e.error_uri = this.errorUri), e;
  }
  get errorCode() {
    return this.constructor.errorCode;
  }
}
class Vs extends Ve {
}
Vs.errorCode = "invalid_request";
class va extends Ve {
}
va.errorCode = "invalid_client";
class ya extends Ve {
}
ya.errorCode = "invalid_grant";
class _a extends Ve {
}
_a.errorCode = "unauthorized_client";
class Hs extends Ve {
}
Hs.errorCode = "unsupported_grant_type";
class Bs extends Ve {
}
Bs.errorCode = "invalid_scope";
class Zs extends Ve {
}
Zs.errorCode = "access_denied";
class br extends Ve {
}
br.errorCode = "server_error";
class Ws extends Ve {
}
Ws.errorCode = "temporarily_unavailable";
class Qs extends Ve {
}
Qs.errorCode = "unsupported_response_type";
class Gs extends Ve {
}
Gs.errorCode = "unsupported_token_type";
class Js extends Ve {
}
Js.errorCode = "invalid_token";
class Ks extends Ve {
}
Ks.errorCode = "method_not_allowed";
class Ys extends Ve {
}
Ys.errorCode = "too_many_requests";
class Xs extends Ve {
}
Xs.errorCode = "invalid_client_metadata";
class en extends Ve {
}
en.errorCode = "insufficient_scope";
const Hd = {
  [Vs.errorCode]: Vs,
  [va.errorCode]: va,
  [ya.errorCode]: ya,
  [_a.errorCode]: _a,
  [Hs.errorCode]: Hs,
  [Bs.errorCode]: Bs,
  [Zs.errorCode]: Zs,
  [br.errorCode]: br,
  [Ws.errorCode]: Ws,
  [Qs.errorCode]: Qs,
  [Gs.errorCode]: Gs,
  [Js.errorCode]: Js,
  [Ks.errorCode]: Ks,
  [Ys.errorCode]: Ys,
  [Xs.errorCode]: Xs,
  [en.errorCode]: en
};
class Et extends Error {
  constructor(e) {
    super(e ?? "Unauthorized");
  }
}
const Ps = "code", Cs = "S256";
function zo(s, e) {
  const r = s.client_secret !== void 0;
  return e.length === 0 ? r ? "client_secret_post" : "none" : r && e.includes("client_secret_basic") ? "client_secret_basic" : r && e.includes("client_secret_post") ? "client_secret_post" : e.includes("none") ? "none" : r ? "client_secret_post" : "none";
}
function Vo(s, e, r, a) {
  const { client_id: t, client_secret: n } = e;
  switch (s) {
    case "client_secret_basic":
      Bd(t, n, r);
      return;
    case "client_secret_post":
      Zd(t, n, a);
      return;
    case "none":
      Wd(t, a);
      return;
    default:
      throw new Error(`Unsupported client authentication method: ${s}`);
  }
}
function Bd(s, e, r) {
  if (!e)
    throw new Error("client_secret_basic authentication requires a client_secret");
  const a = btoa(`${s}:${e}`);
  r.set("Authorization", `Basic ${a}`);
}
function Zd(s, e, r) {
  r.set("client_id", s), e && r.set("client_secret", e);
}
function Wd(s, e) {
  e.set("client_id", s);
}
async function En(s) {
  const e = s instanceof Response ? s.status : void 0, r = s instanceof Response ? await s.text() : s;
  try {
    const a = jd.parse(JSON.parse(r)), { error: t, error_description: n, error_uri: o } = a, i = Hd[t] || br;
    return new i(n || "", o);
  } catch (a) {
    const t = `${e ? `HTTP ${e}: ` : ""}Invalid OAuth error response: ${a}. Raw body: ${r}`;
    return new br(t);
  }
}
async function pr(s, e) {
  var r, a;
  try {
    return await xs(s, e);
  } catch (t) {
    if (t instanceof va || t instanceof _a)
      return await ((r = s.invalidateCredentials) === null || r === void 0 ? void 0 : r.call(s, "all")), await xs(s, e);
    if (t instanceof ya)
      return await ((a = s.invalidateCredentials) === null || a === void 0 ? void 0 : a.call(s, "tokens")), await xs(s, e);
    throw t;
  }
}
async function xs(s, { serverUrl: e, authorizationCode: r, scope: a, resourceMetadataUrl: t, fetchFn: n }) {
  let o, i;
  try {
    o = await Gd(e, { resourceMetadataUrl: t }, n), o.authorization_servers && o.authorization_servers.length > 0 && (i = o.authorization_servers[0]);
  } catch {
  }
  i || (i = e);
  const u = await Qd(e, s, o), l = await eh(i, {
    fetchFn: n
  });
  let h = await Promise.resolve(s.clientInformation());
  if (!h) {
    if (r !== void 0)
      throw new Error("Existing OAuth client information is required when exchanging an authorization code");
    if (!s.saveClientInformation)
      throw new Error("OAuth client information must be saveable for dynamic registration");
    const v = await sh(i, {
      metadata: l,
      clientMetadata: s.clientMetadata,
      fetchFn: n
    });
    await s.saveClientInformation(v), h = v;
  }
  if (r !== void 0) {
    const v = await s.codeVerifier(), y = await rh(i, {
      metadata: l,
      clientInformation: h,
      authorizationCode: r,
      codeVerifier: v,
      redirectUri: s.redirectUrl,
      resource: u,
      addClientAuthentication: s.addClientAuthentication,
      fetchFn: n
    });
    return await s.saveTokens(y), "AUTHORIZED";
  }
  const f = await s.tokens();
  if (f != null && f.refresh_token)
    try {
      const v = await ah(i, {
        metadata: l,
        clientInformation: h,
        refreshToken: f.refresh_token,
        resource: u,
        addClientAuthentication: s.addClientAuthentication,
        fetchFn: n
      });
      return await s.saveTokens(v), "AUTHORIZED";
    } catch (v) {
      if (!(!(v instanceof Ve) || v instanceof br)) throw v;
    }
  const p = s.state ? await s.state() : void 0, { authorizationUrl: d, codeVerifier: g } = await th(i, {
    metadata: l,
    clientInformation: h,
    state: p,
    redirectUrl: s.redirectUrl,
    scope: a || s.clientMetadata.scope,
    resource: u
  });
  return await s.saveCodeVerifier(g), await s.redirectToAuthorization(d), "REDIRECT";
}
async function Qd(s, e, r) {
  const a = zd(s);
  if (e.validateResourceURL)
    return await e.validateResourceURL(a, r == null ? void 0 : r.resource);
  if (r) {
    if (!Vd({ requestedResource: a, configuredResource: r.resource }))
      throw new Error(`Protected resource ${r.resource} does not match expected ${a} (or origin)`);
    return new URL(r.resource);
  }
}
function tn(s) {
  const e = s.headers.get("WWW-Authenticate");
  if (!e)
    return;
  const [r, a] = e.split(" ");
  if (r.toLowerCase() !== "bearer" || !a)
    return;
  const n = /resource_metadata="([^"]*)"/.exec(e);
  if (n)
    try {
      return new URL(n[1]);
    } catch {
      return;
    }
}
async function Gd(s, e, r = fetch) {
  const a = await Yd(s, "oauth-protected-resource", r, {
    protocolVersion: e == null ? void 0 : e.protocolVersion,
    metadataUrl: e == null ? void 0 : e.resourceMetadataUrl
  });
  if (!a || a.status === 404)
    throw new Error("Resource server does not implement OAuth 2.0 Protected Resource Metadata.");
  if (!a.ok)
    throw new Error(`HTTP ${a.status} trying to load well-known OAuth protected resource metadata.`);
  return Fd.parse(await a.json());
}
async function Sn(s, e, r = fetch) {
  try {
    return await r(s, { headers: e });
  } catch (a) {
    if (a instanceof TypeError)
      return e ? Sn(s, void 0, r) : void 0;
    throw a;
  }
}
function Jd(s, e = "", r = {}) {
  return e.endsWith("/") && (e = e.slice(0, -1)), r.prependPathname ? `${e}/.well-known/${s}` : `/.well-known/${s}${e}`;
}
async function Zi(s, e, r = fetch) {
  return await Sn(s, {
    "MCP-Protocol-Version": e
  }, r);
}
function Kd(s, e) {
  return !s || s.status >= 400 && s.status < 500 && e !== "/";
}
async function Yd(s, e, r, a) {
  var t, n;
  const o = new URL(s), i = (t = a == null ? void 0 : a.protocolVersion) !== null && t !== void 0 ? t : Ea;
  let u;
  if (a != null && a.metadataUrl)
    u = new URL(a.metadataUrl);
  else {
    const h = Jd(e, o.pathname);
    u = new URL(h, (n = a == null ? void 0 : a.metadataServerUrl) !== null && n !== void 0 ? n : o), u.search = o.search;
  }
  let l = await Zi(u, i, r);
  if (!(a != null && a.metadataUrl) && Kd(l, o.pathname)) {
    const h = new URL(`/.well-known/${e}`, o);
    l = await Zi(h, i, r);
  }
  return l;
}
function Xd(s) {
  const e = typeof s == "string" ? new URL(s) : s, r = e.pathname !== "/", a = [];
  if (!r)
    return a.push({
      url: new URL("/.well-known/oauth-authorization-server", e.origin),
      type: "oauth"
    }), a.push({
      url: new URL("/.well-known/openid-configuration", e.origin),
      type: "oidc"
    }), a;
  let t = e.pathname;
  return t.endsWith("/") && (t = t.slice(0, -1)), a.push({
    url: new URL(`/.well-known/oauth-authorization-server${t}`, e.origin),
    type: "oauth"
  }), a.push({
    url: new URL("/.well-known/oauth-authorization-server", e.origin),
    type: "oauth"
  }), a.push({
    url: new URL(`/.well-known/openid-configuration${t}`, e.origin),
    type: "oidc"
  }), a.push({
    url: new URL(`${t}/.well-known/openid-configuration`, e.origin),
    type: "oidc"
  }), a;
}
async function eh(s, { fetchFn: e = fetch, protocolVersion: r = Ea } = {}) {
  const a = {
    "MCP-Protocol-Version": r,
    Accept: "application/json"
  }, t = Xd(s);
  for (const { url: n, type: o } of t) {
    const i = await Sn(n, a, e);
    if (i) {
      if (!i.ok) {
        if (i.status >= 400 && i.status < 500)
          continue;
        throw new Error(`HTTP ${i.status} trying to load ${o === "oauth" ? "OAuth" : "OpenID provider"} metadata from ${n}`);
      }
      return o === "oauth" ? Uo.parse(await i.json()) : Md.parse(await i.json());
    }
  }
}
async function th(s, { metadata: e, clientInformation: r, redirectUrl: a, scope: t, state: n, resource: o }) {
  let i;
  if (e) {
    if (i = new URL(e.authorization_endpoint), !e.response_types_supported.includes(Ps))
      throw new Error(`Incompatible auth server: does not support response type ${Ps}`);
    if (e.code_challenge_methods_supported && !e.code_challenge_methods_supported.includes(Cs))
      throw new Error(`Incompatible auth server: does not support code challenge method ${Cs}`);
  } else
    i = new URL("/authorize", s);
  const u = await Dd(), l = u.code_verifier, h = u.code_challenge;
  return i.searchParams.set("response_type", Ps), i.searchParams.set("client_id", r.client_id), i.searchParams.set("code_challenge", h), i.searchParams.set("code_challenge_method", Cs), i.searchParams.set("redirect_uri", String(a)), n && i.searchParams.set("state", n), t && i.searchParams.set("scope", t), t != null && t.includes("offline_access") && i.searchParams.append("prompt", "consent"), o && i.searchParams.set("resource", o.href), { authorizationUrl: i, codeVerifier: l };
}
async function rh(s, { metadata: e, clientInformation: r, authorizationCode: a, codeVerifier: t, redirectUri: n, resource: o, addClientAuthentication: i, fetchFn: u }) {
  var l;
  const h = "authorization_code", f = e != null && e.token_endpoint ? new URL(e.token_endpoint) : new URL("/token", s);
  if (e != null && e.grant_types_supported && !e.grant_types_supported.includes(h))
    throw new Error(`Incompatible auth server: does not support grant type ${h}`);
  const p = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json"
  }), d = new URLSearchParams({
    grant_type: h,
    code: a,
    code_verifier: t,
    redirect_uri: String(n)
  });
  if (i)
    i(p, d, s, e);
  else {
    const v = (l = e == null ? void 0 : e.token_endpoint_auth_methods_supported) !== null && l !== void 0 ? l : [], y = zo(r, v);
    Vo(y, r, p, d);
  }
  o && d.set("resource", o.href);
  const g = await (u ?? fetch)(f, {
    method: "POST",
    headers: p,
    body: d
  });
  if (!g.ok)
    throw await En(g);
  return qo.parse(await g.json());
}
async function ah(s, { metadata: e, clientInformation: r, refreshToken: a, resource: t, addClientAuthentication: n, fetchFn: o }) {
  var i;
  const u = "refresh_token";
  let l;
  if (e) {
    if (l = new URL(e.token_endpoint), e.grant_types_supported && !e.grant_types_supported.includes(u))
      throw new Error(`Incompatible auth server: does not support grant type ${u}`);
  } else
    l = new URL("/token", s);
  const h = new Headers({
    "Content-Type": "application/x-www-form-urlencoded"
  }), f = new URLSearchParams({
    grant_type: u,
    refresh_token: a
  });
  if (n)
    n(h, f, s, e);
  else {
    const d = (i = e == null ? void 0 : e.token_endpoint_auth_methods_supported) !== null && i !== void 0 ? i : [], g = zo(r, d);
    Vo(g, r, h, f);
  }
  t && f.set("resource", t.href);
  const p = await (o ?? fetch)(l, {
    method: "POST",
    headers: h,
    body: f
  });
  if (!p.ok)
    throw await En(p);
  return qo.parse({ refresh_token: a, ...await p.json() });
}
async function sh(s, { metadata: e, clientMetadata: r, fetchFn: a }) {
  let t;
  if (e) {
    if (!e.registration_endpoint)
      throw new Error("Incompatible auth server: does not support dynamic client registration");
    t = new URL(e.registration_endpoint);
  } else
    t = new URL("/register", s);
  const n = await (a ?? fetch)(t, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(r)
  });
  if (!n.ok)
    throw await En(n);
  return qd.parse(await n.json());
}
class nh extends Error {
  constructor(e, r, a) {
    super(`SSE error: ${r}`), this.code = e, this.event = a;
  }
}
class ih {
  constructor(e, r) {
    this._url = e, this._resourceMetadataUrl = void 0, this._eventSourceInit = r == null ? void 0 : r.eventSourceInit, this._requestInit = r == null ? void 0 : r.requestInit, this._authProvider = r == null ? void 0 : r.authProvider, this._fetch = r == null ? void 0 : r.fetch;
  }
  async _authThenStart() {
    var e;
    if (!this._authProvider)
      throw new Et("No auth provider");
    let r;
    try {
      r = await pr(this._authProvider, {
        serverUrl: this._url,
        resourceMetadataUrl: this._resourceMetadataUrl,
        fetchFn: this._fetch
      });
    } catch (a) {
      throw (e = this.onerror) === null || e === void 0 || e.call(this, a), a;
    }
    if (r !== "AUTHORIZED")
      throw new Et();
    return await this._startOrAuth();
  }
  async _commonHeaders() {
    var e;
    const r = {};
    if (this._authProvider) {
      const a = await this._authProvider.tokens();
      a && (r.Authorization = `Bearer ${a.access_token}`);
    }
    return this._protocolVersion && (r["mcp-protocol-version"] = this._protocolVersion), new Headers({ ...r, ...(e = this._requestInit) === null || e === void 0 ? void 0 : e.headers });
  }
  _startOrAuth() {
    var e, r, a;
    const t = (a = (r = (e = this === null || this === void 0 ? void 0 : this._eventSourceInit) === null || e === void 0 ? void 0 : e.fetch) !== null && r !== void 0 ? r : this._fetch) !== null && a !== void 0 ? a : fetch;
    return new Promise((n, o) => {
      this._eventSource = new ca(this._url.href, {
        ...this._eventSourceInit,
        fetch: async (i, u) => {
          const l = await this._commonHeaders();
          l.set("Accept", "text/event-stream");
          const h = await t(i, {
            ...u,
            headers: l
          });
          return h.status === 401 && h.headers.has("www-authenticate") && (this._resourceMetadataUrl = tn(h)), h;
        }
      }), this._abortController = new AbortController(), this._eventSource.onerror = (i) => {
        var u;
        if (i.code === 401 && this._authProvider) {
          this._authThenStart().then(n, o);
          return;
        }
        const l = new nh(i.code, i.message, i);
        o(l), (u = this.onerror) === null || u === void 0 || u.call(this, l);
      }, this._eventSource.onopen = () => {
      }, this._eventSource.addEventListener("endpoint", (i) => {
        var u;
        const l = i;
        try {
          if (this._endpoint = new URL(l.data, this._url), this._endpoint.origin !== this._url.origin)
            throw new Error(`Endpoint origin does not match connection origin: ${this._endpoint.origin}`);
        } catch (h) {
          o(h), (u = this.onerror) === null || u === void 0 || u.call(this, h), this.close();
          return;
        }
        n();
      }), this._eventSource.onmessage = (i) => {
        var u, l;
        const h = i;
        let f;
        try {
          f = ia.parse(JSON.parse(h.data));
        } catch (p) {
          (u = this.onerror) === null || u === void 0 || u.call(this, p);
          return;
        }
        (l = this.onmessage) === null || l === void 0 || l.call(this, f);
      };
    });
  }
  async start() {
    if (this._eventSource)
      throw new Error("SSEClientTransport already started! If using Client class, note that connect() calls start() automatically.");
    return await this._startOrAuth();
  }
  /**
   * Call this method after the user has finished authorizing via their user agent and is redirected back to the MCP client application. This will exchange the authorization code for an access token, enabling the next connection attempt to successfully auth.
   */
  async finishAuth(e) {
    if (!this._authProvider)
      throw new Et("No auth provider");
    if (await pr(this._authProvider, {
      serverUrl: this._url,
      authorizationCode: e,
      resourceMetadataUrl: this._resourceMetadataUrl,
      fetchFn: this._fetch
    }) !== "AUTHORIZED")
      throw new Et("Failed to authorize");
  }
  async close() {
    var e, r, a;
    (e = this._abortController) === null || e === void 0 || e.abort(), (r = this._eventSource) === null || r === void 0 || r.close(), (a = this.onclose) === null || a === void 0 || a.call(this);
  }
  async send(e) {
    var r, a, t;
    if (!this._endpoint)
      throw new Error("Not connected");
    try {
      const n = await this._commonHeaders();
      n.set("content-type", "application/json");
      const o = {
        ...this._requestInit,
        method: "POST",
        headers: n,
        body: JSON.stringify(e),
        signal: (r = this._abortController) === null || r === void 0 ? void 0 : r.signal
      }, i = await ((a = this._fetch) !== null && a !== void 0 ? a : fetch)(this._endpoint, o);
      if (!i.ok) {
        if (i.status === 401 && this._authProvider) {
          if (this._resourceMetadataUrl = tn(i), await pr(this._authProvider, {
            serverUrl: this._url,
            resourceMetadataUrl: this._resourceMetadataUrl,
            fetchFn: this._fetch
          }) !== "AUTHORIZED")
            throw new Et();
          return this.send(e);
        }
        const u = await i.text().catch(() => null);
        throw new Error(`Error POSTing to endpoint (HTTP ${i.status}): ${u}`);
      }
    } catch (n) {
      throw (t = this.onerror) === null || t === void 0 || t.call(this, n), n;
    }
  }
  setProtocolVersion(e) {
    this._protocolVersion = e;
  }
}
const He = st("SSEPlugin");
class Ho {
  constructor() {
    B(this, "metadata", {
      name: "SSE Transport Plugin",
      version: "1.0.0",
      transportType: "sse",
      description: "Server-Sent Events transport for MCP protocol",
      author: "MCP SuperAssistant"
    });
    B(this, "config", {});
    B(this, "transport", null);
    B(this, "isConnectedFlag", !1);
    B(this, "connectionPromise", null);
  }
  async initialize(e) {
    this.config = {
      keepAlive: !0,
      connectionTimeout: 5e3,
      readTimeout: 3e4,
      ...e
    }, He.debug("Initialized with config:", this.config);
  }
  async connect(e) {
    He.debug(`Creating transport for: ${e}`);
    try {
      const r = await this.createConnection(e);
      return this.transport = r, He.debug("[SSEPlugin] Transport created successfully"), r;
    } catch (r) {
      throw He.error("[SSEPlugin] Transport creation failed:", r), r;
    }
  }
  async createConnection(e) {
    try {
      const r = new URL(e);
      He.debug(`Creating SSE transport for: ${r.toString()}`);
      const a = new ih(r);
      return He.debug("[SSEPlugin] SSE transport created successfully"), a;
    } catch (r) {
      const a = r instanceof Error ? r.message : String(r);
      let t = a;
      throw a.includes("404") ? t = "SSE endpoint not found (404). Verify the server URL and SSE endpoint path." : a.includes("timeout") ? t = "SSE connection timeout. The server may be slow or the endpoint may not support SSE." : a.includes("Failed to fetch") && (t = "SSE connection failed. Check if the server is running and accessible."), new Error(`SSE Plugin: ${t}`);
    }
  }
  async disconnect() {
    if (He.debug("[SSEPlugin] Disconnecting..."), this.transport)
      try {
        "close" in this.transport && typeof this.transport.close == "function" && await this.transport.close();
      } catch (e) {
        He.warn("[SSEPlugin] Error during transport cleanup:", e);
      }
    this.transport = null, this.isConnectedFlag = !1, this.connectionPromise = null, He.debug("[SSEPlugin] Disconnected");
  }
  isConnected() {
    return this.transport !== null;
  }
  isSupported(e) {
    try {
      const r = new URL(e);
      return r.protocol === "http:" || r.protocol === "https:";
    } catch {
      return !1;
    }
  }
  getDefaultConfig() {
    return {
      keepAlive: !0,
      connectionTimeout: 5e3,
      readTimeout: 3e4,
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache"
      }
    };
  }
  async isHealthy() {
    if (!this.isConnected() || !this.transport)
      return !1;
    try {
      return !0;
    } catch (e) {
      return He.warn("[SSEPlugin] Health check failed:", e), !1;
    }
  }
  async callTool(e, r, a) {
    if (!this.isConnected())
      throw new Error("SSE Plugin: Not connected");
    He.debug(`Calling tool: ${r}`);
    try {
      const t = await e.callTool({ name: r, arguments: a });
      return He.debug(`Tool call completed: ${r}`), t;
    } catch (t) {
      throw He.error(`Tool call failed: ${r}`, t), t;
    }
  }
  async getPrimitives(e) {
    if (!this.isConnected())
      throw new Error("SSE Plugin: Not connected");
    He.debug("[SSEPlugin] Getting primitives...");
    try {
      const r = e.getServerCapabilities(), a = [], t = [];
      return r != null && r.resources && t.push(
        e.listResources().then(({ resources: n }) => {
          n.forEach((o) => a.push({ type: "resource", value: o }));
        })
      ), r != null && r.tools && t.push(
        e.listTools().then(({ tools: n }) => {
          n.forEach((o) => a.push({ type: "tool", value: o }));
        })
      ), r != null && r.prompts && t.push(
        e.listPrompts().then(({ prompts: n }) => {
          n.forEach((o) => a.push({ type: "prompt", value: o }));
        })
      ), await Promise.all(t), He.debug(`Retrieved ${a.length} primitives`), a;
    } catch (r) {
      throw He.error("[SSEPlugin] Failed to get primitives:", r), r;
    }
  }
}
const Ge = st("WebSocketTransport");
class oh {
  constructor(e, r = {}) {
    // Transport interface callbacks - required by MCP client
    B(this, "onmessage");
    B(this, "onclose");
    B(this, "onerror");
    B(this, "ws", null);
    B(this, "url");
    B(this, "options");
    B(this, "messageQueue", []);
    B(this, "isConnected", !1);
    // Removed ping/pong timers - using MCP protocol connection management
    B(this, "eventListeners", /* @__PURE__ */ new Map());
    this.url = e, this.options = {
      protocols: ["mcp-v1"],
      pingInterval: 3e4,
      pongTimeout: 5e3,
      binaryType: "arraybuffer",
      maxReconnectAttempts: 3,
      ...r
    };
  }
  async start() {
    Ge.debug("[WebSocketTransport] Start method called - initiating connection"), await this.connect();
  }
  async connect() {
    if (this.isConnected || this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      Ge.debug("[WebSocketTransport] Already connected or connecting");
      return;
    }
    return new Promise((e, r) => {
      try {
        Ge.debug(`Connecting to: ${this.url}`), this.ws = new WebSocket(this.url, this.options.protocols), this.ws.binaryType = this.options.binaryType || "arraybuffer";
        const a = setTimeout(() => {
          this.ws && this.ws.readyState === WebSocket.CONNECTING && (this.ws.close(), r(new Error("WebSocket connection timeout")));
        }, 1e4);
        this.ws.onopen = () => {
          clearTimeout(a), Ge.debug("[WebSocketTransport] Connected"), this.isConnected = !0, this.startPingPong(), this.processMessageQueue(), e();
        }, this.ws.onclose = (t) => {
          clearTimeout(a), Ge.debug(`Disconnected: ${t.code} ${t.reason}`), this.isConnected = !1, this.stopPingPong(), this.emit("close", { code: t.code, reason: t.reason }), this.onclose && this.onclose();
        }, this.ws.onerror = (t) => {
          clearTimeout(a), Ge.error("[WebSocketTransport] Error:", t), this.isConnected = !1, this.emit("error", t), this.onerror && this.onerror(new Error("WebSocket connection failed")), r(new Error("WebSocket connection failed"));
        }, this.ws.onmessage = (t) => {
          try {
            let n;
            if (typeof t.data == "string")
              n = JSON.parse(t.data);
            else if (t.data instanceof ArrayBuffer) {
              const o = new TextDecoder().decode(t.data);
              n = JSON.parse(o);
            } else {
              Ge.warn("[WebSocketTransport] Received unknown data type:", typeof t.data);
              return;
            }
            this.emit("message", n), this.onmessage && this.onmessage(n);
          } catch (n) {
            Ge.error("[WebSocketTransport] Failed to parse message:", n);
            const o = new Error("Failed to parse WebSocket message");
            this.emit("error", o), this.onerror && this.onerror(o);
          }
        };
      } catch (a) {
        r(a);
      }
    });
  }
  async close() {
    Ge.debug("[WebSocketTransport] Closing connection"), this.isConnected = !1, this.stopPingPong(), this.ws && (this.ws.close(1e3, "Normal closure"), this.ws = null);
  }
  async send(e) {
    const r = JSON.stringify(e);
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      Ge.debug("[WebSocketTransport] Queuing message (not connected)"), this.messageQueue.push(e);
      return;
    }
    try {
      this.ws.send(r);
    } catch (a) {
      throw Ge.error("[WebSocketTransport] Failed to send message:", a), this.messageQueue.push(e), a;
    }
  }
  processMessageQueue() {
    if (this.messageQueue.length === 0) return;
    Ge.debug(`Processing ${this.messageQueue.length} queued messages`);
    const e = [...this.messageQueue];
    this.messageQueue = [], e.forEach((r) => {
      try {
        this.send(r);
      } catch (a) {
        Ge.error("[WebSocketTransport] Failed to send queued message:", a), this.messageQueue.push(r);
      }
    });
  }
  startPingPong() {
    Ge.debug("[WebSocketTransport] Skipping custom ping/pong - relying on MCP protocol and server-side monitoring");
  }
  stopPingPong() {
  }
  // Removed custom ping/pong methods - using MCP protocol instead
  // Event emitter functionality
  on(e, r) {
    this.eventListeners.has(e) || this.eventListeners.set(e, /* @__PURE__ */ new Set()), this.eventListeners.get(e).add(r);
  }
  off(e, r) {
    const a = this.eventListeners.get(e);
    a && a.delete(r);
  }
  emit(e, r) {
    const a = this.eventListeners.get(e);
    a && a.forEach((t) => {
      try {
        t(r);
      } catch (n) {
        Ge.error(`Error in ${e} listener:`, n);
      }
    });
  }
  getReadyState() {
    var e;
    return ((e = this.ws) == null ? void 0 : e.readyState) ?? WebSocket.CLOSED;
  }
  isConnectionOpen() {
    var e;
    return this.isConnected && ((e = this.ws) == null ? void 0 : e.readyState) === WebSocket.OPEN;
  }
}
const Oe = st("WebSocketPlugin");
class Bo {
  constructor() {
    B(this, "metadata", {
      name: "WebSocket Transport Plugin",
      version: "1.0.0",
      transportType: "websocket",
      description: "WebSocket transport for MCP protocol with real-time bidirectional communication",
      author: "MCP SuperAssistant"
    });
    B(this, "config", {});
    B(this, "transport", null);
    B(this, "isConnectedFlag", !1);
    B(this, "connectionPromise", null);
    B(this, "lastPingTime", 0);
    B(this, "disconnectionCallback");
  }
  async initialize(e) {
    this.config = {
      protocols: ["mcp-v1"],
      pingInterval: 3e4,
      pongTimeout: 5e3,
      maxReconnectAttempts: 3,
      binaryType: "arraybuffer",
      ...e
    }, Oe.debug("Initialized with config:", this.config);
  }
  async connect(e) {
    Oe.debug(`Creating transport for: ${e}`);
    try {
      const r = await this.createConnection(e);
      return this.transport = r, Oe.debug("[WebSocketPlugin] Transport created successfully"), r;
    } catch (r) {
      throw Oe.error("[WebSocketPlugin] Transport creation failed:", r), r;
    }
  }
  async createConnection(e) {
    try {
      const r = new URL(e);
      if (r.protocol !== "ws:" && r.protocol !== "wss:")
        throw new Error(`Invalid WebSocket protocol: ${r.protocol}. Expected ws: or wss:`);
      Oe.debug(`Creating WebSocket transport for: ${r.toString()}`);
      const a = new oh(r.toString(), {
        protocols: this.config.protocols,
        pingInterval: this.config.pingInterval,
        pongTimeout: this.config.pongTimeout,
        binaryType: this.config.binaryType,
        maxReconnectAttempts: this.config.maxReconnectAttempts
      });
      return a.on("close", (t) => {
        Oe.debug(`Transport closed: ${t.code} ${t.reason}`), this.isConnectedFlag = !1, this.handleDisconnection("WebSocket closed", t.code, t.reason);
      }), a.on("error", (t) => {
        Oe.error("[WebSocketPlugin] Transport error:", t), t.message.includes("Pong timeout") || (this.isConnectedFlag = !1, this.handleDisconnection("WebSocket error", void 0, t.message));
      }), Oe.debug("[WebSocketPlugin] WebSocket transport created successfully"), a;
    } catch (r) {
      const a = r instanceof Error ? r.message : String(r);
      let t = a;
      throw a.includes("timeout") ? t = "WebSocket connection timeout. The server may be slow or unreachable." : a.includes("Failed to construct") ? t = "Invalid WebSocket URL format. Check the URI syntax." : a.includes("connection failed") ? t = "WebSocket connection failed. Check if the server is running and accessible." : a.includes("protocol") && (t = "WebSocket protocol error. The server may not support the requested protocols."), new Error(`WebSocket Plugin: ${t}`);
    }
  }
  async disconnect() {
    if (Oe.debug("[WebSocketPlugin] Disconnecting..."), this.transport)
      try {
        await this.transport.close();
      } catch (e) {
        Oe.warn("[WebSocketPlugin] Error during transport cleanup:", e);
      }
    this.transport = null, this.isConnectedFlag = !1, this.connectionPromise = null, Oe.debug("[WebSocketPlugin] Disconnected");
  }
  isConnected() {
    return this.transport !== null;
  }
  isSupported(e) {
    try {
      const r = new URL(e);
      return r.protocol === "ws:" || r.protocol === "wss:";
    } catch {
      return !1;
    }
  }
  getDefaultConfig() {
    return {
      protocols: ["mcp-v1"],
      maxReconnectAttempts: 3,
      binaryType: "arraybuffer"
      // Removed ping/pong settings - using MCP protocol connection management
    };
  }
  async isHealthy() {
    if (!this.isConnected() || !this.transport)
      return !1;
    try {
      const e = this.transport.getReadyState();
      return e === WebSocket.OPEN ? ((this.config.pingInterval || 3e4) > 0, !0) : (Oe.warn(`WebSocket not in OPEN state: ${e}`), !1);
    } catch (e) {
      return Oe.warn("[WebSocketPlugin] Health check failed:", e), !1;
    }
  }
  async callTool(e, r, a) {
    if (!this.isConnected())
      throw new Error("WebSocket Plugin: Not connected");
    Oe.debug(`Calling tool: ${r}`);
    try {
      const t = await e.callTool({ name: r, arguments: a });
      return Oe.debug(`Tool call completed: ${r}`), t;
    } catch (t) {
      throw Oe.error(`Tool call failed: ${r}`, t), this.isConnected() ? t : (this.isConnectedFlag = !1, new Error(`WebSocket connection lost during tool call: ${r}`));
    }
  }
  async getPrimitives(e) {
    if (!this.isConnected())
      throw new Error("WebSocket Plugin: Not connected");
    Oe.debug("[WebSocketPlugin] Getting primitives...");
    try {
      const r = e.getServerCapabilities(), a = [], t = [];
      return r != null && r.resources && t.push(
        e.listResources().then(({ resources: n }) => {
          n.forEach((o) => a.push({ type: "resource", value: o }));
        })
      ), r != null && r.tools && t.push(
        e.listTools().then(({ tools: n }) => {
          n.forEach((o) => a.push({ type: "tool", value: o }));
        })
      ), r != null && r.prompts && t.push(
        e.listPrompts().then(({ prompts: n }) => {
          n.forEach((o) => a.push({ type: "prompt", value: o }));
        })
      ), await Promise.all(t), Oe.debug(`Retrieved ${a.length} primitives`), a;
    } catch (r) {
      throw Oe.error("[WebSocketPlugin] Failed to get primitives:", r), this.isConnected() ? r : (this.isConnectedFlag = !1, new Error("WebSocket connection lost while getting primitives"));
    }
  }
  /**
   * Set a callback to be called when the WebSocket disconnects
   */
  setDisconnectionCallback(e) {
    this.disconnectionCallback = e;
  }
  /**
   * Handle disconnection events by notifying the main client
   */
  handleDisconnection(e, r, a) {
    if (Oe.debug(`Handling disconnection: ${e} (code: ${r}, details: ${a})`), this.disconnectionCallback)
      try {
        this.disconnectionCallback(e, r, a);
      } catch (t) {
        Oe.error("[WebSocketPlugin] Error in disconnection callback:", t);
      }
  }
}
class ch extends TransformStream {
  constructor({ onError: e, onRetry: r, onComment: a } = {}) {
    let t;
    super({
      start(n) {
        t = jo({
          onEvent: (o) => {
            n.enqueue(o);
          },
          onError(o) {
            e === "terminate" ? n.error(o) : typeof e == "function" && e(o);
          },
          onRetry: r,
          onComment: a
        });
      },
      transform(n) {
        t.feed(n);
      }
    });
  }
}
const lh = {
  initialReconnectionDelay: 1e3,
  maxReconnectionDelay: 3e4,
  reconnectionDelayGrowFactor: 1.5,
  maxRetries: 2
};
class sa extends Error {
  constructor(e, r) {
    super(`Streamable HTTP error: ${r}`), this.code = e;
  }
}
class uh {
  constructor(e, r) {
    var a;
    this._hasCompletedAuthFlow = !1, this._url = e, this._resourceMetadataUrl = void 0, this._requestInit = r == null ? void 0 : r.requestInit, this._authProvider = r == null ? void 0 : r.authProvider, this._fetch = r == null ? void 0 : r.fetch, this._sessionId = r == null ? void 0 : r.sessionId, this._reconnectionOptions = (a = r == null ? void 0 : r.reconnectionOptions) !== null && a !== void 0 ? a : lh;
  }
  async _authThenStart() {
    var e;
    if (!this._authProvider)
      throw new Et("No auth provider");
    let r;
    try {
      r = await pr(this._authProvider, {
        serverUrl: this._url,
        resourceMetadataUrl: this._resourceMetadataUrl,
        fetchFn: this._fetch
      });
    } catch (a) {
      throw (e = this.onerror) === null || e === void 0 || e.call(this, a), a;
    }
    if (r !== "AUTHORIZED")
      throw new Et();
    return await this._startOrAuthSse({ resumptionToken: void 0 });
  }
  async _commonHeaders() {
    var e;
    const r = {};
    if (this._authProvider) {
      const t = await this._authProvider.tokens();
      t && (r.Authorization = `Bearer ${t.access_token}`);
    }
    this._sessionId && (r["mcp-session-id"] = this._sessionId), this._protocolVersion && (r["mcp-protocol-version"] = this._protocolVersion);
    const a = this._normalizeHeaders((e = this._requestInit) === null || e === void 0 ? void 0 : e.headers);
    return new Headers({
      ...r,
      ...a
    });
  }
  async _startOrAuthSse(e) {
    var r, a, t;
    const { resumptionToken: n } = e;
    try {
      const o = await this._commonHeaders();
      o.set("Accept", "text/event-stream"), n && o.set("last-event-id", n);
      const i = await ((r = this._fetch) !== null && r !== void 0 ? r : fetch)(this._url, {
        method: "GET",
        headers: o,
        signal: (a = this._abortController) === null || a === void 0 ? void 0 : a.signal
      });
      if (!i.ok) {
        if (i.status === 401 && this._authProvider)
          return await this._authThenStart();
        if (i.status === 405)
          return;
        throw new sa(i.status, `Failed to open SSE stream: ${i.statusText}`);
      }
      this._handleSseStream(i.body, e, !0);
    } catch (o) {
      throw (t = this.onerror) === null || t === void 0 || t.call(this, o), o;
    }
  }
  /**
   * Calculates the next reconnection delay using  backoff algorithm
   *
   * @param attempt Current reconnection attempt count for the specific stream
   * @returns Time to wait in milliseconds before next reconnection attempt
   */
  _getNextReconnectionDelay(e) {
    const r = this._reconnectionOptions.initialReconnectionDelay, a = this._reconnectionOptions.reconnectionDelayGrowFactor, t = this._reconnectionOptions.maxReconnectionDelay;
    return Math.min(r * Math.pow(a, e), t);
  }
  _normalizeHeaders(e) {
    return e ? e instanceof Headers ? Object.fromEntries(e.entries()) : Array.isArray(e) ? Object.fromEntries(e) : { ...e } : {};
  }
  /**
   * Schedule a reconnection attempt with exponential backoff
   *
   * @param lastEventId The ID of the last received event for resumability
   * @param attemptCount Current reconnection attempt count for this specific stream
   */
  _scheduleReconnection(e, r = 0) {
    var a;
    const t = this._reconnectionOptions.maxRetries;
    if (t > 0 && r >= t) {
      (a = this.onerror) === null || a === void 0 || a.call(this, new Error(`Maximum reconnection attempts (${t}) exceeded.`));
      return;
    }
    const n = this._getNextReconnectionDelay(r);
    setTimeout(() => {
      this._startOrAuthSse(e).catch((o) => {
        var i;
        (i = this.onerror) === null || i === void 0 || i.call(this, new Error(`Failed to reconnect SSE stream: ${o instanceof Error ? o.message : String(o)}`)), this._scheduleReconnection(e, r + 1);
      });
    }, n);
  }
  _handleSseStream(e, r, a) {
    if (!e)
      return;
    const { onresumptiontoken: t, replayMessageId: n } = r;
    let o;
    (async () => {
      var u, l, h, f;
      try {
        const p = e.pipeThrough(new TextDecoderStream()).pipeThrough(new ch()).getReader();
        for (; ;) {
          const { value: d, done: g } = await p.read();
          if (g)
            break;
          if (d.id && (o = d.id, t == null || t(d.id)), !d.event || d.event === "message")
            try {
              const v = ia.parse(JSON.parse(d.data));
              n !== void 0 && Ds(v) && (v.id = n), (u = this.onmessage) === null || u === void 0 || u.call(this, v);
            } catch (v) {
              (l = this.onerror) === null || l === void 0 || l.call(this, v);
            }
        }
      } catch (p) {
        if ((h = this.onerror) === null || h === void 0 || h.call(this, new Error(`SSE stream disconnected: ${p}`)), a && this._abortController && !this._abortController.signal.aborted)
          try {
            this._scheduleReconnection({
              resumptionToken: o,
              onresumptiontoken: t,
              replayMessageId: n
            }, 0);
          } catch (d) {
            (f = this.onerror) === null || f === void 0 || f.call(this, new Error(`Failed to reconnect: ${d instanceof Error ? d.message : String(d)}`));
          }
      }
    })();
  }
  async start() {
    if (this._abortController)
      throw new Error("StreamableHTTPClientTransport already started! If using Client class, note that connect() calls start() automatically.");
    this._abortController = new AbortController();
  }
  /**
   * Call this method after the user has finished authorizing via their user agent and is redirected back to the MCP client application. This will exchange the authorization code for an access token, enabling the next connection attempt to successfully auth.
   */
  async finishAuth(e) {
    if (!this._authProvider)
      throw new Et("No auth provider");
    if (await pr(this._authProvider, {
      serverUrl: this._url,
      authorizationCode: e,
      resourceMetadataUrl: this._resourceMetadataUrl,
      fetchFn: this._fetch
    }) !== "AUTHORIZED")
      throw new Et("Failed to authorize");
  }
  async close() {
    var e, r;
    (e = this._abortController) === null || e === void 0 || e.abort(), (r = this.onclose) === null || r === void 0 || r.call(this);
  }
  async send(e, r) {
    var a, t, n, o;
    try {
      const { resumptionToken: i, onresumptiontoken: u } = r || {};
      if (i) {
        this._startOrAuthSse({ resumptionToken: i, replayMessageId: ho(e) ? e.id : void 0 }).catch((y) => {
          var _;
          return (_ = this.onerror) === null || _ === void 0 ? void 0 : _.call(this, y);
        });
        return;
      }
      const l = await this._commonHeaders();
      l.set("content-type", "application/json"), l.set("accept", "application/json, text/event-stream");
      const h = {
        ...this._requestInit,
        method: "POST",
        headers: l,
        body: JSON.stringify(e),
        signal: (a = this._abortController) === null || a === void 0 ? void 0 : a.signal
      }, f = await ((t = this._fetch) !== null && t !== void 0 ? t : fetch)(this._url, h), p = f.headers.get("mcp-session-id");
      if (p && (this._sessionId = p), !f.ok) {
        if (f.status === 401 && this._authProvider) {
          if (this._hasCompletedAuthFlow)
            throw new sa(401, "Server returned 401 after successful authentication");
          if (this._resourceMetadataUrl = tn(f), await pr(this._authProvider, {
            serverUrl: this._url,
            resourceMetadataUrl: this._resourceMetadataUrl,
            fetchFn: this._fetch
          }) !== "AUTHORIZED")
            throw new Et();
          return this._hasCompletedAuthFlow = !0, this.send(e);
        }
        const y = await f.text().catch(() => null);
        throw new Error(`Error POSTing to endpoint (HTTP ${f.status}): ${y}`);
      }
      if (this._hasCompletedAuthFlow = !1, f.status === 202) {
        jl(e) && this._startOrAuthSse({ resumptionToken: void 0 }).catch((y) => {
          var _;
          return (_ = this.onerror) === null || _ === void 0 ? void 0 : _.call(this, y);
        });
        return;
      }
      const g = (Array.isArray(e) ? e : [e]).filter((y) => "method" in y && "id" in y && y.id !== void 0).length > 0, v = f.headers.get("content-type");
      if (g)
        if (v != null && v.includes("text/event-stream"))
          this._handleSseStream(f.body, { onresumptiontoken: u }, !1);
        else if (v != null && v.includes("application/json")) {
          const y = await f.json(), _ = Array.isArray(y) ? y.map((D) => ia.parse(D)) : [ia.parse(y)];
          for (const D of _)
            (n = this.onmessage) === null || n === void 0 || n.call(this, D);
        } else
          throw new sa(-1, `Unexpected content type: ${v}`);
    } catch (i) {
      throw (o = this.onerror) === null || o === void 0 || o.call(this, i), i;
    }
  }
  get sessionId() {
    return this._sessionId;
  }
  /**
   * Terminates the current session by sending a DELETE request to the server.
   *
   * Clients that no longer need a particular session
   * (e.g., because the user is leaving the client application) SHOULD send an
   * HTTP DELETE to the MCP endpoint with the Mcp-Session-Id header to explicitly
   * terminate the session.
   *
   * The server MAY respond with HTTP 405 Method Not Allowed, indicating that
   * the server does not allow clients to terminate sessions.
   */
  async terminateSession() {
    var e, r, a;
    if (this._sessionId)
      try {
        const t = await this._commonHeaders(), n = {
          ...this._requestInit,
          method: "DELETE",
          headers: t,
          signal: (e = this._abortController) === null || e === void 0 ? void 0 : e.signal
        }, o = await ((r = this._fetch) !== null && r !== void 0 ? r : fetch)(this._url, n);
        if (!o.ok && o.status !== 405)
          throw new sa(o.status, `Failed to terminate session: ${o.statusText}`);
        this._sessionId = void 0;
      } catch (t) {
        throw (a = this.onerror) === null || a === void 0 || a.call(this, t), t;
      }
  }
  setProtocolVersion(e) {
    this._protocolVersion = e;
  }
  get protocolVersion() {
    return this._protocolVersion;
  }
}
const Ne = st("StreamableHttpPlugin");
class Zo {
  constructor() {
    B(this, "metadata", {
      name: "StreamableHttpPlugin",
      version: "1.0.0",
      transportType: "streamable-http",
      description: "Streamable HTTP transport for MCP protocol",
      author: "MCP SuperAssistant"
    });
    B(this, "transport", null);
  }
  async initialize(e) {
    Ne.debug("Initialized with config:", e);
  }
  async connect(e) {
    Ne.debug(`Creating transport for: ${e}`);
    try {
      const r = await this.createConnection(e);
      return this.transport = r, Ne.debug("[StreamableHttpPlugin] Transport created successfully"), r;
    } catch (r) {
      throw Ne.error("[StreamableHttpPlugin] Transport creation failed:", r), r;
    }
  }
  async createConnection(e) {
    try {
      const r = new URL(e);
      Ne.debug(`Creating Streamable HTTP transport for: ${r.toString()}`);
      const a = new uh(r);
      return Ne.debug("[StreamableHttpPlugin] Streamable HTTP transport created successfully"), a;
    } catch (r) {
      const a = r instanceof Error ? r.message : String(r);
      let t = a;
      throw a.includes("404") ? t = "Streamable HTTP endpoint not found (404). Verify the server URL and endpoint path." : a.includes("timeout") ? t = "Streamable HTTP connection timeout. The server may be slow or unreachable." : a.includes("Failed to fetch") ? t = "Streamable HTTP connection failed. Check if the server is running and accessible." : a.includes("protocol") && (t = "Streamable HTTP protocol error. The server may not support streamable HTTP."), new Error(`StreamableHttpPlugin: ${t}`);
    }
  }
  async disconnect() {
    if (Ne.debug("[StreamableHttpPlugin] Disconnecting..."), this.transport)
      try {
        await this.transport.close();
      } catch (e) {
        Ne.warn("[StreamableHttpPlugin] Error during transport cleanup:", e);
      }
    this.transport = null, Ne.debug("[StreamableHttpPlugin] Disconnected");
  }
  isConnected() {
    return this.transport !== null;
  }
  isSupported(e) {
    try {
      const r = new URL(e);
      return r.protocol === "http:" || r.protocol === "https:";
    } catch {
      return !1;
    }
  }
  getDefaultConfig() {
    return {
      keepAlive: !0,
      connectionTimeout: 5e3,
      readTimeout: 3e4,
      fallbackToSSE: !1,
      maxRetries: 2
    };
  }
  async isHealthy() {
    if (!this.isConnected() || !this.transport)
      return !1;
    try {
      return !0;
    } catch (e) {
      return Ne.warn("[StreamableHttpPlugin] Health check failed:", e), !1;
    }
  }
  async callTool(e, r, a) {
    if (!this.isConnected())
      throw new Error("StreamableHttpPlugin: Not connected");
    Ne.debug(`Calling tool: ${r}`);
    try {
      const t = await e.callTool({ name: r, arguments: a });
      return Ne.debug(`Tool call completed: ${r}`), t;
    } catch (t) {
      throw Ne.error(`Tool call failed: ${r}`, t), t;
    }
  }
  async getPrimitives(e) {
    if (!this.isConnected())
      throw new Error("StreamableHttpPlugin: Not connected");
    Ne.debug("[StreamableHttpPlugin] Getting primitives...");
    try {
      const r = e.getServerCapabilities(), a = [], t = [];
      return r != null && r.resources && t.push(
        e.listResources().then(({ resources: n }) => {
          n.forEach((o) => a.push({ type: "resource", value: o }));
        }).catch((n) => {
          Ne.warn("[StreamableHttpPlugin] Failed to list resources:", n);
        })
      ), r != null && r.tools && t.push(
        e.listTools().then(({ tools: n }) => {
          n.forEach((o) => a.push({ type: "tool", value: o }));
        }).catch((n) => {
          Ne.warn("[StreamableHttpPlugin] Failed to list tools:", n);
        })
      ), r != null && r.prompts && t.push(
        e.listPrompts().then(({ prompts: n }) => {
          n.forEach((o) => a.push({ type: "prompt", value: o }));
        }).catch((n) => {
          Ne.warn("[StreamableHttpPlugin] Failed to list prompts:", n);
        })
      ), await Promise.all(t), Ne.debug(`Retrieved ${a.length} primitives`), a;
    } catch (r) {
      return Ne.error("[StreamableHttpPlugin] Failed to get primitives:", r), [];
    }
  }
}
const Tt = st("PluginRegistry");
class dh extends Mo {
  constructor() {
    super();
    B(this, "plugins", /* @__PURE__ */ new Map());
    B(this, "initialized", /* @__PURE__ */ new Set());
    Tt.debug("[PluginRegistry] Initialized");
  }
  async register(r) {
    const { transportType: a } = r.metadata;
    this.plugins.has(a) && Tt.warn(`Plugin for transport '${a}' already registered, replacing`), this.plugins.set(a, r), Tt.debug(
      `Registered plugin: ${r.metadata.name} v${r.metadata.version} (${a})`
    ), this.emit("registry:plugin-registered", { plugin: r });
  }
  unregister(r) {
    return this.plugins.get(r) ? (this.plugins.delete(r), this.initialized.delete(r), Tt.debug(`Unregistered plugin for transport: ${r}`), this.emit("registry:plugin-unregistered", { type: r }), !0) : !1;
  }
  getPlugin(r) {
    return this.plugins.get(r);
  }
  async getInitializedPlugin(r, a) {
    const t = this.getPlugin(r);
    if (!t)
      throw new Error(`Plugin for transport '${r}' not found`);
    if (!this.initialized.has(r)) {
      const n = a || t.getDefaultConfig();
      await t.initialize(n), this.initialized.add(r), Tt.debug(`Initialized plugin: ${r}`);
    }
    return t;
  }
  isPluginAvailable(r) {
    return this.plugins.has(r);
  }
  isPluginInitialized(r) {
    return this.initialized.has(r);
  }
  listAvailable() {
    return Array.from(this.plugins.keys());
  }
  listInitialized() {
    return Array.from(this.initialized);
  }
  getPluginInfo(r) {
    const a = this.plugins.get(r);
    return {
      available: !!a,
      initialized: this.initialized.has(r),
      metadata: a == null ? void 0 : a.metadata
    };
  }
  async loadDefaultPlugins() {
    Tt.debug("[PluginRegistry] Loading default plugins...");
    try {
      await this.register(new Ho()), await this.register(new Bo()), await this.register(new Zo());
      const r = this.plugins.size;
      Tt.debug(`Loaded ${r} default plugins`), this.emit("registry:plugins-loaded", { count: r });
    } catch (r) {
      throw Tt.error("[PluginRegistry] Failed to load default plugins:", r), new Error(`Failed to load default plugins: ${r instanceof Error ? r.message : String(r)}`);
    }
  }
  clear() {
    this.plugins.clear(), this.initialized.clear(), Tt.debug("[PluginRegistry] Cleared all plugins");
  }
  getStats() {
    return {
      totalPlugins: this.plugins.size,
      initializedPlugins: this.initialized.size,
      availableTypes: this.listAvailable(),
      initializedTypes: this.listInitialized()
    };
  }
}
const As = {
  defaultTransport: "sse",
  defaultUri: "http://localhost:3006/sse",
  plugins: {
    sse: {
      keepAlive: !0,
      connectionTimeout: 5e3,
      readTimeout: 3e4
    },
    websocket: {
      protocols: ["mcp-v1"],
      pingInterval: 3e4,
      pongTimeout: 5e3,
      maxReconnectAttempts: 3,
      binaryType: "arraybuffer"
    },
    "streamable-http": {
      keepAlive: !0,
      connectionTimeout: 5e3,
      readTimeout: 3e4,
      fallbackToSSE: !1,
      maxRetries: 2
    }
  },
  global: {
    timeout: 3e4,
    maxRetries: 3,
    healthCheckInterval: 6e4,
    reconnectDelay: 2e3,
    logLevel: "info"
  }
}, hh = "G-6ENY3Y3H9X", fh = "I0PHa_CWTbuTlXSb3T-kXg", Je = st("AnalyticsService"), ph = "https://www.google-analytics.com/mp/collect", Wi = !("update_url" in chrome.runtime.getManifest()), mh = ph, gh = 100, vh = 30, Qi = typeof window < "u";
async function yh() {
  try {
    let e = (await chrome.storage.local.get("clientId")).clientId;
    return e || (e = self.crypto.randomUUID(), await chrome.storage.local.set({ clientId: e }), Je.debug("[GA4] Generated new clientId:", e)), e;
  } catch (s) {
    return Je.error("[GA4] Error getting or creating clientId:", s), "error-client-id";
  }
}
async function _h() {
  try {
    let { sessionData: s } = await chrome.storage.session.get("sessionData");
    const e = Date.now();
    return s && s.timestamp && ((e - s.timestamp) / 6e4 > vh ? (s = null, Je.debug("[GA4] Session expired, starting new one.")) : (s.timestamp = e, await chrome.storage.session.set({ sessionData: s }))), s || (s = {
      session_id: e.toString(),
      timestamp: e
      // Store timestamp as number
    }, await chrome.storage.session.set({ sessionData: s }), Je.debug("[GA4] Created new session:", s.session_id)), s.session_id;
  } catch (s) {
    return Je.error("[GA4] Error getting or creating session_id:", s), "error-session-id";
  }
}
async function Ke(s, e, r) {
  try {
    const a = await yh(), t = await _h(), n = {
      name: s,
      params: {
        session_id: t,
        engagement_time_msec: gh,
        ...e
        // Spread user-provided params
      }
    }, o = {
      client_id: a,
      events: [n]
    };
    r && (o.user_properties = r), Je.debug(`[GA4] Sending event: ${s}`, JSON.stringify(e));
    const i = await fetch(`${mh}?measurement_id=${hh}&api_secret=${fh}`, {
      method: "POST",
      body: JSON.stringify(o),
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (i.ok) {
      if (Je.debug("[GA4] Event sent successfully."), Wi && i.status !== 204)
        try {
          const u = await i.json();
          Je.debug("[GA4] Debug endpoint success response:", JSON.stringify(u, null, 2));
        } catch {
          Je.debug("[GA4] Debug endpoint success response likely had no body (e.g., 200 OK with empty body).");
        }
    } else if (Je.warn(`[GA4] Analytics request failed: ${i.status} ${i.statusText}`), Wi)
      try {
        const u = await i.json();
        Je.error("[GA4] Debug endpoint error response:", JSON.stringify(u, null, 2));
      } catch {
        Je.error("[GA4] Debug endpoint error response could not be parsed as JSON:", await i.text());
      }
  } catch (a) {
    Je.error("[GA4] Error sending analytics event:", a);
  }
}
function rn() {
  try {
    const s = (navigator == null ? void 0 : navigator.userAgent) || "Unknown", e = (navigator == null ? void 0 : navigator.language) || "en";
    let r = "Unknown", a = "Unknown", t = "Unknown", n = "Unknown";
    if (s.indexOf("Firefox") > -1) {
      r = "Firefox";
      const p = s.match(/Firefox\/(\d+\.\d+)/);
      a = p && p[1] ? p[1] : "Unknown";
    } else if (s.indexOf("Edg") > -1) {
      r = "Edge";
      const p = s.match(/Edg\/(\d+\.\d+)/);
      a = p && p[1] ? p[1] : "Unknown";
    } else if (s.indexOf("Chrome") > -1) {
      r = "Chrome";
      const p = s.match(/Chrome\/(\d+\.\d+)/);
      a = p && p[1] ? p[1] : "Unknown";
    } else if (s.indexOf("Safari") > -1) {
      r = "Safari";
      const p = s.match(/Version\/(\d+\.\d+)/);
      a = p && p[1] ? p[1] : "Unknown";
    } else if (s.indexOf("MSIE") > -1 || s.indexOf("Trident/") > -1) {
      r = "Internet Explorer";
      const p = s.match(/(?:MSIE |rv:)(\d+\.\d+)/);
      a = p && p[1] ? p[1] : "Unknown";
    }
    if (s.indexOf("Windows") > -1) {
      t = "Windows";
      const p = s.match(/Windows NT (\d+\.\d+)/), d = p && p[1] ? p[1] : "Unknown";
      n = {
        "10.0": "10/11",
        "6.3": "8.1",
        "6.2": "8",
        "6.1": "7",
        "6.0": "Vista",
        "5.2": "XP x64",
        "5.1": "XP"
      }[d] || d;
    } else if (s.indexOf("Mac") > -1) {
      t = "macOS";
      const p = s.match(/Mac OS X ([\d_]+)/);
      n = p && p[1] ? p[1].replace(/_/g, ".") : "Unknown";
    } else if (s.indexOf("Linux") > -1) {
      t = "Linux";
      const p = s.match(/Linux ([\w\d\.]+)/);
      n = p && p[1] ? p[1] : "Unknown";
    } else if (s.indexOf("Android") > -1) {
      t = "Android";
      const p = s.match(/Android ([\d\.]+)/);
      n = p && p[1] ? p[1] : "Unknown";
    } else if (s.indexOf("iOS") > -1 || s.indexOf("iPhone") > -1 || s.indexOf("iPad") > -1) {
      t = "iOS";
      const p = s.match(/OS ([\d_]+)/);
      n = p && p[1] ? p[1].replace(/_/g, ".") : "Unknown";
    }
    let o = "desktop";
    /Mobi|Android|iPhone|iPad|iPod/i.test(s) && (o = /iPad|tablet/i.test(s) ? "tablet" : "mobile");
    const i = e.split("-")[1] || e;
    let u = "Unknown", l = 1, h = "Unknown", f = 0;
    if (Qi && typeof window < "u")
      try {
        u = `${window.screen.width}x${window.screen.height}`, l = window.devicePixelRatio || 1, h = Intl.DateTimeFormat().resolvedOptions().timeZone, f = (/* @__PURE__ */ new Date()).getTimezoneOffset() / -60;
      } catch (p) {
        Je.debug("[GA4] Window-dependent features not available:", p);
      }
    return {
      browser: r,
      browser_version: a,
      operating_system: t,
      os_version: n,
      language: e,
      region: i,
      screen_resolution: u,
      pixel_ratio: l,
      device_type: o,
      timezone: h,
      timezone_offset: f,
      user_agent: s,
      context: Qi ? "content_script" : "background_service_worker"
    };
  } catch (s) {
    return Je.error("[GA4] Error collecting demographic data:", s), {
      browser: "Unknown",
      browser_version: "Unknown",
      operating_system: "Unknown",
      os_version: "Unknown",
      language: "en",
      region: "Unknown",
      screen_resolution: "Unknown",
      pixel_ratio: 1,
      device_type: "desktop",
      timezone: "Unknown",
      timezone_offset: 0,
      user_agent: "Unknown",
      context: "error",
      error: "Failed to collect demographic data"
    };
  }
}
async function Wo(s, e) {
  var r;
  await Ke("extension_error", {
    error_message: s.message,
    error_stack: (r = s.stack) == null ? void 0 : r.substring(0, 500),
    // Limit stack trace length
    error_context: e
  });
}
const Zt = st("AnalyticsService"), Yt = class Yt {
  // 2 seconds
  constructor() {
    // Session state
    B(this, "sessionStartTime", Date.now());
    B(this, "sessionToolExecutions", 0);
    B(this, "sessionUniqueTools", /* @__PURE__ */ new Set());
    B(this, "sessionAdapters", /* @__PURE__ */ new Set());
    B(this, "sessionConnections", 0);
    B(this, "sessionErrors", 0);
    B(this, "lastUserAction", "none");
    // User properties cache
    B(this, "userProperties", {});
    B(this, "demographicData", {});
    // Connection state
    B(this, "currentConnectionStatus", "disconnected");
    B(this, "connectionStartTime", null);
    B(this, "currentTransportType", null);
    B(this, "toolsAvailableCount", 0);
    // Active adapter
    B(this, "activeAdapter", null);
    // Debouncing for connection events
    B(this, "lastConnectionTrackTime", 0);
    B(this, "CONNECTION_TRACK_DEBOUNCE", 2e3);
    this.initialize();
  }
  static getInstance() {
    return Yt.instance || (Yt.instance = new Yt()), Yt.instance;
  }
  /**
   * Initialize analytics service with user properties
   */
  async initialize() {
    try {
      const e = await chrome.storage.local.get([
        "installDate",
        "version",
        "userProperties",
        "ga4UserPropertiesSet"
      ]);
      this.demographicData = rn(), this.userProperties = {
        extension_version: chrome.runtime.getManifest().version,
        install_date: e.installDate || (/* @__PURE__ */ new Date()).toISOString(),
        ...this.demographicData,
        ...e.userProperties || {}
      }, Zt.debug("[AnalyticsService] Initialized with user properties:", this.userProperties), e.ga4UserPropertiesSet || (await this.setGA4UserProperties(), await chrome.storage.local.set({ ga4UserPropertiesSet: !0 }));
    } catch (e) {
      Zt.error("[AnalyticsService] Initialization failed:", e);
    }
  }
  /**
   * Set GA4 user properties (called once on first launch)
   * These are static demographics that don't change and will be available in all GA4 reports
   */
  async setGA4UserProperties() {
    try {
      const e = {
        extension_version: { value: this.userProperties.extension_version },
        install_date: { value: this.userProperties.install_date },
        browser: { value: this.demographicData.browser },
        browser_version: { value: this.demographicData.browser_version },
        operating_system: { value: this.demographicData.operating_system },
        os_version: { value: this.demographicData.os_version },
        device_type: { value: this.demographicData.device_type },
        language: { value: this.demographicData.language },
        region: { value: this.demographicData.region },
        screen_resolution: { value: this.demographicData.screen_resolution },
        pixel_ratio: { value: this.demographicData.pixel_ratio },
        timezone: { value: this.demographicData.timezone },
        timezone_offset: { value: this.demographicData.timezone_offset }
      };
      await Ke("user_properties_initialized", {}, e), Zt.debug("[AnalyticsService] GA4 user properties set successfully");
    } catch (e) {
      Zt.error("[AnalyticsService] Failed to set GA4 user properties:", e);
    }
  }
  /**
   * Get common event parameters that should be included in all events
   * Note: Static demographics (browser, OS, etc.) are set as GA4 user properties
   * and don't need to be included in every event.
   */
  getCommonParameters() {
    return {
      // Dynamic/session-specific fields only
      extension_version: this.userProperties.extension_version,
      // Can change on update
      session_duration_ms: Date.now() - this.sessionStartTime,
      // Increases over time
      user_segment: this.getUserSegment(),
      // Changes with usage
      days_since_install: this.getDaysSinceInstall()
      // Increases daily
    };
  }
  /**
   * Track tool execution with enhanced context
   */
  async trackToolExecution(e) {
    const r = this.sessionToolExecutions === 0;
    this.sessionToolExecutions++, this.sessionUniqueTools.add(e.tool_name);
    const a = e.adapter_name || this.activeAdapter || "none";
    await Ke("mcp_tool_executed", {
      ...e,
      ...this.getCommonParameters(),
      connection_status: this.currentConnectionStatus,
      active_adapter: a,
      // Use adapter name from content script
      tools_available_count: this.toolsAvailableCount,
      session_tool_count: this.sessionToolExecutions,
      is_first_tool_execution: r,
      unique_tools_used: this.sessionUniqueTools.size
    }), e.execution_status === "error" && this.sessionErrors++;
  }
  /**
   * Track connection status changes
   */
  async trackConnectionChange(e) {
    const r = Date.now();
    if (!(e.tools_discovered && e.tools_discovered > 0 && this.toolsAvailableCount === 0) && r - this.lastConnectionTrackTime < this.CONNECTION_TRACK_DEBOUNCE) {
      Zt.debug("[AnalyticsService] Connection event debounced (too soon after last event)"), this.currentConnectionStatus = e.connection_status, this.currentTransportType = e.transport_type, e.tools_discovered && (this.toolsAvailableCount = e.tools_discovered);
      return;
    }
    this.lastConnectionTrackTime = r;
    const t = this.currentConnectionStatus, n = this.connectionStartTime ? Date.now() - this.connectionStartTime : 0;
    this.currentConnectionStatus = e.connection_status, this.currentTransportType = e.transport_type, e.connection_status === "connected" ? (this.connectionStartTime = Date.now(), this.sessionConnections++, this.toolsAvailableCount = e.tools_discovered || 0) : e.connection_status === "disconnected" && (this.connectionStartTime = null, this.toolsAvailableCount = 0), await Ke("mcp_connection_changed", {
      ...e,
      ...this.getCommonParameters(),
      previous_status: t,
      connection_duration_ms: n,
      session_connections_count: this.sessionConnections,
      active_adapter: this.activeAdapter || "none"
    }), e.connection_status === "error" && this.sessionErrors++;
  }
  /**
   * Track adapter activation
   */
  async trackAdapterActivation(e) {
    const r = this.activeAdapter;
    this.activeAdapter = e.adapter_name, this.sessionAdapters.add(e.adapter_name), this.toolsAvailableCount = e.tools_available, await Ke("adapter_activated", {
      ...e,
      ...this.getCommonParameters(),
      previous_adapter: r || "none",
      session_adapter_switches: this.sessionAdapters.size,
      connection_status: this.currentConnectionStatus
    });
  }
  /**
   * Track feature usage
   */
  async trackFeatureUsage(e) {
    this.lastUserAction = e.feature_name, await Ke("feature_used", {
      ...e,
      ...this.getCommonParameters(),
      active_adapter: this.activeAdapter || "none",
      connection_status: this.currentConnectionStatus,
      tools_available: this.toolsAvailableCount
    });
  }
  /**
   * Track enhanced error with context
   */
  async trackError(e) {
    var r;
    this.sessionErrors++, await Ke("extension_error", {
      ...e,
      ...this.getCommonParameters(),
      error_stack: (r = e.error_stack) == null ? void 0 : r.substring(0, 500),
      // Limit stack trace
      user_action_before_error: this.lastUserAction,
      tools_available_when_error: this.toolsAvailableCount,
      connection_status: this.currentConnectionStatus,
      active_adapter: this.activeAdapter || "none",
      session_errors_count: this.sessionErrors
    });
  }
  /**
   * Track session summary (call on extension unload or periodically)
   */
  async trackSessionSummary() {
    const e = Date.now() - this.sessionStartTime;
    await Ke("session_summary", {
      ...this.getCommonParameters(),
      session_duration_ms: e,
      tools_executed_count: this.sessionToolExecutions,
      unique_tools_used: this.sessionUniqueTools.size,
      unique_adapters_used: this.sessionAdapters.size,
      adapters_activated: Array.from(this.sessionAdapters),
      connections_made: this.sessionConnections,
      errors_encountered: this.sessionErrors,
      final_connection_status: this.currentConnectionStatus
    });
  }
  /**
   * Update user properties (call on extension install/update)
   */
  async updateUserProperties(e) {
    this.userProperties = {
      ...this.userProperties,
      ...e
    }, await chrome.storage.local.set({ userProperties: this.userProperties }), Zt.debug("[AnalyticsService] User properties updated:", this.userProperties);
  }
  /**
   * Reset session state (call on new session start)
   */
  resetSession() {
    this.sessionStartTime = Date.now(), this.sessionToolExecutions = 0, this.sessionUniqueTools.clear(), this.sessionAdapters.clear(), this.sessionConnections = 0, this.sessionErrors = 0, this.lastUserAction = "none", Zt.debug("[AnalyticsService] Session reset");
  }
  /**
   * Get days since installation
   */
  getDaysSinceInstall() {
    const e = this.userProperties.install_date;
    if (!e) return 0;
    const r = new Date(e).getTime(), a = Date.now();
    return Math.floor((a - r) / (1e3 * 60 * 60 * 24));
  }
  /**
   * Determine user segment based on usage patterns
   */
  getUserSegment() {
    const e = this.getDaysSinceInstall(), r = this.sessionToolExecutions;
    return e < 7 ? "new_user" : e < 30 ? r > 20 ? "engaged_new_user" : "recent_user" : r > 100 ? "power_user" : r > 30 ? "active_user" : r > 5 ? "regular_user" : "casual_user";
  }
  /**
   * Get current session state (for debugging)
   */
  getSessionState() {
    return {
      sessionDuration: Date.now() - this.sessionStartTime,
      toolExecutions: this.sessionToolExecutions,
      uniqueTools: this.sessionUniqueTools.size,
      adapters: Array.from(this.sessionAdapters),
      connections: this.sessionConnections,
      errors: this.sessionErrors,
      connectionStatus: this.currentConnectionStatus,
      activeAdapter: this.activeAdapter,
      toolsAvailable: this.toolsAvailableCount,
      userSegment: this.getUserSegment(),
      daysSinceInstall: this.getDaysSinceInstall()
    };
  }
};
B(Yt, "instance", null);
let an = Yt;
const Gt = an.getInstance(), oe = st("McpClient"), suppressibleMcpErrorPatterns = [
  /SSE error/i,
  /Failed to fetch/i,
  /ERR_CONNECTION_REFUSED/i,
  /ERR_CONNECTION_RESET/i,
  /ERR_NETWORK/i
];
function shouldSuppressMcpErrorLog(e) {
  if (!e) return !1;
  const r = typeof e == "string" ? e : e && typeof e.message == "string" ? e.message : typeof e.toString == "function" ? e.toString() : "";
  return !!r && suppressibleMcpErrorPatterns.some((a) => a.test(r));
}
class Gi extends Mo {
  // 5 minutes
  constructor(r = {}) {
    super();
    B(this, "registry");
    B(this, "config");
    B(this, "client", null);
    B(this, "activePlugin", null);
    B(this, "activeTransport", null);
    B(this, "isConnectedFlag", !1);
    B(this, "connectionPromise", null);
    B(this, "healthCheckTimer", null);
    B(this, "primitivesCache", null);
    B(this, "primitivesCacheTime", 0);
    B(this, "CACHE_TTL", 3e5);
    this.config = {
      ...As,
      ...r,
      global: {
        ...As.global,
        ...r.global
      },
      plugins: {
        ...As.plugins,
        ...r.plugins
      }
    }, this.registry = new dh(), this.registry.on("registry:plugin-registered", (a) => {
      this.emit("registry:plugin-registered", a);
    }), this.registry.on("registry:plugins-loaded", (a) => {
      this.emit("registry:plugins-loaded", a);
    }), oe.debug("[McpClient] Initialized with config:", this.config), this.emit("client:initialized", { config: this.config });
  }
  async initialize() {
    try {
      oe.debug("[McpClient] Loading default plugins..."), await this.registry.loadDefaultPlugins(), oe.debug("[McpClient] Initialization complete");
    } catch (r) {
      oe.error("[McpClient] Initialization failed:", r), oe.debug("[McpClient] Attempting manual plugin registration as fallback...");
      try {
        await this.manualPluginRegistration(), oe.debug("[McpClient] Manual plugin registration successful");
      } catch (a) {
        throw oe.error("[McpClient] Manual plugin registration also failed:", a), r;
      }
    }
  }
  async manualPluginRegistration() {
    await this.registry.register(new Ho()), await this.registry.register(new Bo()), await this.registry.register(new Zo()), oe.debug("[McpClient] Manual plugin registration completed");
  }
  async connect(r) {
    var a, t, n, o;
    if (this.isConnectedFlag && ((a = this.activePlugin) == null ? void 0 : a.metadata.transportType) === r.type) {
      oe.debug(`Already connected via ${r.type}, skipping`);
      return;
    }
    if (this.connectionPromise) {
      oe.debug("[McpClient] Connection already in progress, waiting...");
      try {
        if (await this.connectionPromise, this.isConnectedFlag && ((t = this.activePlugin) == null ? void 0 : t.metadata.transportType) === r.type) {
          oe.debug("[McpClient] Existing connection matches request");
          return;
        }
      } catch {
        oe.debug("[McpClient] Previous connection failed, starting new one"), this.connectionPromise = null;
      }
    }
    this.isConnectedFlag && ((n = this.activePlugin) == null ? void 0 : n.metadata.transportType) !== r.type && (oe.debug(`Switching from ${(o = this.activePlugin) == null ? void 0 : o.metadata.transportType} to ${r.type}`), await this.disconnect()), this.connectionPromise = this.performConnection(r);
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }
  async performConnection(r) {
    const { uri: a, type: t, config: n } = r;
    try {
      oe.debug(`Connecting to ${a} via ${t}`), this.emit("client:connecting", { uri: a, type: t }), this.isConnectedFlag && await this.disconnect();
      const o = {
        ...this.config.plugins[t],
        ...n
      }, i = await this.registry.getInitializedPlugin(t, o);
      if (!i.isSupported(a))
        throw new Error(`Plugin ${t} does not support URI: ${a}`);
      const u = await i.connect(a);
      t === "websocket" && "setDisconnectionCallback" in i && i.setDisconnectionCallback((p, d, g) => {
        oe.debug(`WebSocket disconnection detected: ${p} (code: ${d})`), this.isConnectedFlag = !1, this.emit("connection:status-changed", {
          isConnected: !1,
          type: "websocket",
          error: `WebSocket disconnected: ${p}${d ? ` (code: ${d})` : ""}${g ? ` - ${g}` : ""}`
        }), this.cleanup().catch((v) => {
          oe.error("[McpClient] Error during cleanup after WebSocket disconnection:", v);
        });
      }), this.client = new xd(
        {
          name: `mcp-client-${t}`,
          version: "1.0.0"
        },
        { capabilities: {} }
      ), this.client.setNotificationHandler(Io, (p) => {
        oe.debug("Server log:", p.params.data);
      }), oe.debug("Starting MCP client connection to transport...");
      const l = 3e4, h = this.client.connect(u), f = new Promise((p, d) => {
        setTimeout(() => {
          d(new Error(`MCP client connection timeout after ${l}ms`));
        }, l);
      });
      await Promise.race([h, f]), oe.debug("MCP client connected successfully"), this.activePlugin = i, this.activeTransport = u, this.isConnectedFlag = !0, this.clearPrimitivesCache(), this.startHealthMonitoring(), oe.debug(`Successfully connected via ${t}`), this.emit("client:connected", { uri: a, type: t }), this.emit("connection:status-changed", {
        isConnected: !0,
        type: t,
        error: void 0
      }), Gt.trackConnectionChange({
        connection_status: "connected",
        transport_type: t,
        tools_discovered: 0
        // Will be updated after getPrimitives
      }).catch((p) => {
        oe.warn("[McpClient] Analytics tracking failed:", p);
      });
    } catch (o) {
      const i = o instanceof Error ? o.message : String(o), u = shouldSuppressMcpErrorLog(o);
      u ? oe.debug("Connection failed:", o) : oe.error("Connection failed:", o);
      await this.cleanup(), this.emit("client:error", {
        error: o instanceof Error ? o : new Error(i),
        context: "connection"
      }), this.emit("connection:status-changed", {
        isConnected: !1,
        type: t,
        error: i
      }), Gt.trackConnectionChange({
        connection_status: "error",
        transport_type: t,
        error_type: o instanceof Error ? o.name : "UnknownError"
      }).catch((h) => {
        oe.warn("[McpClient] Analytics tracking failed:", h);
      });
      throw o;
    }
  }
  async disconnect() {
    var a;
    if (!this.isConnectedFlag) {
      oe.debug("[McpClient] Already disconnected");
      return;
    }
    const r = (a = this.activePlugin) == null ? void 0 : a.metadata.transportType;
    oe.debug(`Disconnecting from ${r || "unknown"}`), r && this.emit("client:disconnecting", { type: r });
    try {
      await this.cleanup(), oe.debug("[McpClient] Disconnected successfully"), r && this.emit("client:disconnected", { type: r }), this.emit("connection:status-changed", {
        isConnected: !1,
        type: r || null
      });
    } catch (t) {
      oe.error("[McpClient] Error during disconnect:", t), this.emit("client:error", {
        error: t instanceof Error ? t : new Error(String(t)),
        context: "disconnect"
      });
    }
  }
  async cleanup() {
    if (this.stopHealthMonitoring(), this.client) {
      try {
        await this.client.close();
      } catch (r) {
        oe.warn("[McpClient] Error closing client:", r);
      }
      this.client = null;
    }
    if (this.activePlugin) {
      try {
        await this.activePlugin.disconnect();
      } catch (r) {
        oe.warn("[McpClient] Error disconnecting plugin:", r);
      }
      this.activePlugin = null;
    }
    this.activeTransport = null, this.isConnectedFlag = !1, this.clearPrimitivesCache();
  }
  async callTool(r, a, t) {
    var o, i, u;
    if (!this.isConnectedFlag || !this.activePlugin || !this.client)
      throw new Error("Not connected to any MCP server");
    const n = Date.now();
    this.emit("tool:call-started", { toolName: r, args: a });
    try {
      oe.debug(`Calling tool: ${r}`);
      const l = await this.activePlugin.callTool(this.client, r, a), h = Date.now() - n;
      return this.emit("tool:call-completed", { toolName: r, result: l, duration: h }), Gt.trackToolExecution({
        tool_name: r,
        execution_status: "success",
        execution_duration_ms: h,
        transport_type: ((o = this.activePlugin) == null ? void 0 : o.metadata.transportType) || "unknown",
        adapter_name: t
        // Pass adapter name from content script
      }).catch((f) => {
        oe.warn("[McpClient] Analytics tracking failed:", f);
      }), l;
    } catch (l) {
      const h = Date.now() - n, f = l instanceof Error ? l : new Error(String(l));
      throw this.emit("tool:call-failed", { toolName: r, error: f, duration: h }), Gt.trackToolExecution({
        tool_name: r,
        execution_status: "error",
        execution_duration_ms: h,
        transport_type: ((i = this.activePlugin) == null ? void 0 : i.metadata.transportType) || "unknown",
        error_type: f.name || "UnknownError",
        adapter_name: t
        // Pass adapter name from content script
      }).catch((p) => {
        oe.warn("[McpClient] Analytics tracking failed:", p);
      }), await this.isHealthy() || (this.isConnectedFlag = !1, this.emit("connection:status-changed", {
        isConnected: !1,
        type: ((u = this.activePlugin) == null ? void 0 : u.metadata.transportType) || null,
        error: "Connection lost during tool call"
      })), f;
    }
  }
  async getPrimitives(r = !1) {
    var a;
    if (!this.isConnectedFlag || !this.activePlugin || !this.client)
      throw new Error("Not connected to any MCP server");
    if (!r && this.primitivesCache && this.isCacheValid())
      return oe.debug("[McpClient] Returning cached primitives"), this.primitivesCache;
    try {
      oe.debug("[McpClient] Fetching primitives from server...");
      const t = await this.activePlugin.getPrimitives(this.client), n = this.normalizeTools(t.filter((l) => l.type === "tool")), o = t.filter((l) => l.type === "resource").map((l) => l.value), i = t.filter((l) => l.type === "prompt").map((l) => l.value), u = {
        tools: n,
        resources: o,
        prompts: i,
        timestamp: Date.now()
      };
      return this.primitivesCache = u, this.primitivesCacheTime = Date.now(), this.emit("tools:list-updated", {
        tools: n,
        type: this.activePlugin.metadata.transportType
      }), (this.primitivesCache === null || this.primitivesCache.tools.length === 0) && Gt.trackConnectionChange({
        connection_status: "connected",
        transport_type: this.activePlugin.metadata.transportType,
        tools_discovered: n.length
      }).catch((l) => {
        oe.warn("[McpClient] Analytics tracking failed:", l);
      }), oe.debug(
        `Retrieved ${n.length} tools, ${o.length} resources, ${i.length} prompts`
      ), u;
    } catch (t) {
      throw oe.error("[McpClient] Failed to get primitives:", t), await this.isHealthy() || (this.isConnectedFlag = !1, this.emit("connection:status-changed", {
        isConnected: !1,
        type: ((a = this.activePlugin) == null ? void 0 : a.metadata.transportType) || null,
        error: "Connection lost while getting primitives"
      })), t;
    }
  }
  normalizeTools(r) {
    return r.map((a) => {
      const t = a.value;
      return {
        name: t.name,
        description: t.description || "",
        input_schema: t.inputSchema || t.input_schema || {},
        schema: t.inputSchema ? JSON.stringify(t.inputSchema) : t.input_schema ? JSON.stringify(t.input_schema) : "{}",
        ...t.uri && { uri: t.uri },
        ...t.arguments && { arguments: t.arguments }
      };
    });
  }
  clearPrimitivesCache() {
    this.primitivesCache = null, this.primitivesCacheTime = 0;
  }
  isCacheValid() {
    return Date.now() - this.primitivesCacheTime < this.CACHE_TTL;
  }
  async isHealthy() {
    if (!this.isConnectedFlag || !this.activePlugin)
      return !1;
    try {
      return await this.activePlugin.isHealthy();
    } catch (r) {
      return oe.warn("[McpClient] Health check failed:", r), !1;
    }
  }
  isConnected() {
    var r;
    return this.isConnectedFlag && ((r = this.activePlugin) == null ? void 0 : r.isConnected()) === !0;
  }
  getConnectionInfo() {
    var r, a;
    return {
      isConnected: this.isConnectedFlag,
      type: ((r = this.activePlugin) == null ? void 0 : r.metadata.transportType) || null,
      uri: null,
      // Could store this if needed
      pluginInfo: ((a = this.activePlugin) == null ? void 0 : a.metadata) || null
    };
  }
  getAvailableTransports() {
    return this.registry.listAvailable();
  }
  async switchTransport(r) {
    var t;
    const a = ((t = this.activePlugin) == null ? void 0 : t.metadata.transportType) || null;
    a === r.type ? oe.debug(`Already using ${r.type}, reconnecting...`) : (oe.debug(`Switching from ${a} to ${r.type}`), this.emit("client:plugin-switched", { from: a, to: r.type })), await this.connect(r);
  }
  startHealthMonitoring() {
    const r = this.config.global.healthCheckInterval;
    r <= 0 || (this.healthCheckTimer = setInterval(async () => {
      var a;
      if (!this.isConnectedFlag) {
        this.stopHealthMonitoring();
        return;
      }
      try {
        const t = await this.isHealthy(), n = ((a = this.activePlugin) == null ? void 0 : a.metadata.transportType) || null;
        n && this.emit("connection:health-check", {
          healthy: t,
          type: n,
          timestamp: Date.now()
        }), t || (oe.warn(`Health check failed for ${n}`), this.isConnectedFlag = !1, this.emit("connection:status-changed", {
          isConnected: !1,
          type: n,
          error: "Health check failed"
        }));
      } catch (t) {
        oe.error("[McpClient] Health check error:", t);
      }
    }, r));
  }
  stopHealthMonitoring() {
    this.healthCheckTimer && (clearInterval(this.healthCheckTimer), this.healthCheckTimer = null);
  }
  getConfig() {
    return { ...this.config };
  }
  updateConfig(r) {
    this.config = {
      ...this.config,
      ...r,
      global: {
        ...this.config.global,
        ...r.global
      },
      plugins: {
        ...this.config.plugins,
        ...r.plugins
      }
    }, oe.debug("[McpClient] Configuration updated");
  }
}
const Dt = st("mcp_client");
let ot = null;
async function Xr() {
  if (!ot)
    try {
      ot = new Gi(), await ot.initialize(), Ji(ot);
    } catch (s) {
      Dt.error("[getGlobalClient] Failed to initialize client:", s), ot = new Gi(), Ji(ot);
    }
  return ot;
}
function Ji(s) {
  s.on("connection:status-changed", (e) => {
    Dt.debug("[Global Client] Connection status changed:", e), typeof window < "u" && window.dispatchEvent && window.dispatchEvent(new CustomEvent("mcp:connection-status-changed", {
      detail: e
    })), typeof chrome < "u" && chrome.runtime && chrome.runtime.sendMessage && chrome.runtime.sendMessage({
      type: "mcp:connection-status-changed",
      payload: e,
      origin: "mcpclient"
    }).catch(() => {
    });
  }), s.on("client:connected", (e) => {
    Dt.debug("[Global Client] Client connected:", e);
  }), s.on("client:disconnected", (e) => {
    Dt.debug("[Global Client] Client disconnected:", e);
  }), s.on("client:error", (e) => {
    const r = (e == null ? void 0 : e.error) || e;
    if (shouldSuppressMcpErrorLog(r)) {
      Dt.debug("[Global Client] Client error suppressed:", r && r.message ? r.message : r);
      return;
    }
    Dt.error("[Global Client] Client error:", e);
  });
}
function Aa(s) {
  try {
    const e = new URL(s);
    return e.protocol === "ws:" || e.protocol === "wss:" ? "websocket" : "sse";
  } catch {
    return "sse";
  }
}
function bh() {
  return ot ? ot.isConnected() : !1;
}
async function Jt() {
  try {
    return await (await Xr()).isHealthy();
  } catch (s) {
    return Dt.error("[Backward Compatibility] checkMcpServerConnection failed:", s), !1;
  }
}
async function wh(s, e, r, a, t) {
  const n = await Xr(), o = t || Aa(s);
  return n.isConnected() || await n.connect({ uri: s, type: o }), await n.callTool(e, r, a);
}
async function mr(s, e = !1, r) {
  const a = await Xr(), t = r || Aa(s);
  a.isConnected() || await a.connect({ uri: s, type: t });
  const n = await a.getPrimitives(e), o = [];
  return n.tools.forEach((i) => {
    o.push({ type: "tool", value: i });
  }), n.resources.forEach((i) => {
    o.push({ type: "resource", value: i });
  }), n.prompts.forEach((i) => {
    o.push({ type: "prompt", value: i });
  }), o;
}
async function Ki(s, e) {
  const r = await Xr(), a = e || Aa(s);
  r.isConnected() && await r.disconnect(), await r.connect({ uri: s, type: a });
}
async function Eh(s, e) {
  const r = await Xr(), a = e || Aa(s);
  await r.connect({ uri: s, type: a });
  const t = await r.getPrimitives();
  Dt.debug(`Connected, found ${t.tools.length} tools, ${t.resources.length} resources, ${t.prompts.length} prompts`);
}
function Sh() {
  ot && ot.isConnected() && ot.disconnect().catch((s) => {
    Dt.error("[Backward Compatibility] resetMcpConnectionState failed:", s);
  });
}
function Ph() {
  Dt.debug("[Backward Compatibility] resetMcpConnectionStateForRecovery - handled by plugin health monitoring");
}
function gr(s) {
  return s.filter((e) => e.type === "tool").map((e) => {
    const r = e.value;
    return {
      name: r.name,
      description: r.description || "",
      input_schema: r.inputSchema || r.input_schema || {},
      schema: r.inputSchema ? JSON.stringify(r.inputSchema) : r.input_schema ? JSON.stringify(r.input_schema) : "{}",
      ...r.uri && { uri: r.uri },
      ...r.arguments && { arguments: r.arguments }
    };
  });
}
const U = st("BACKGROUND"), ba = "http://localhost:3006/sse", Qo = "ws://localhost:3006/message", Ch = "http://localhost:3006", sn = "sse";
let Le = null, Or = ba, Me = sn, Go = !1, nn = !1;
async function xh() {
  try {
    const s = await chrome.storage.local.get(["mcpServerUrl", "mcpConnectionType"]);
    Me = s.mcpConnectionType || sn;
    const e = Me === "websocket" ? Qo : Me === "streamable-http" ? Ch : ba;
    Or = s.mcpServerUrl || e, nn = !0, U.debug("[Background] Server config loaded from storage:", {
      url: Or,
      type: Me
    });
  } catch (s) {
    U.warn("[Background] Failed to load server config from storage, using defaults:", s), Me = sn, Or = ba, nn = !0;
  }
}
async function Ah() {
  for (; !nn;)
    await new Promise((s) => setTimeout(s, 100));
}
function Lt() {
  return Or;
}
function Rh(s, e) {
  Or = s, e && (Me = e), U.debug("[Background] Server config updated to:", { url: s, type: Me });
}
function Jo() {
  return Go;
}
function ft(s) {
  Go = s, U.debug("[Background] Connection status updated to:", s);
}
let Kt = !1, Wt = 0;
const Rs = 3;
function Th(s) {
  const e = s.message.toLowerCase(), r = [
    /tool .* not found/i,
    /tool not found/i,
    /method not found/i,
    /invalid arguments/i,
    /invalid parameters/i,
    /mcp error -32602/i,
    // Invalid params
    /mcp error -32601/i,
    // Method not found
    /mcp error -32600/i,
    // Invalid request
    /tool '[^']+' is not available/i,
    /tool '[^']+' not found on server/i
  ], a = [
    /connection refused/i,
    /econnrefused/i,
    /timeout/i,
    /etimedout/i,
    /enotfound/i,
    /network error/i,
    /server unavailable/i,
    /could not connect/i,
    /connection failed/i,
    /transport error/i,
    /fetch failed/i
  ];
  return r.some((t) => t.test(e)) ? { isConnectionError: !1, isToolError: !0, category: "tool_error" } : a.some((t) => t.test(e)) ? { isConnectionError: !0, isToolError: !1, category: "connection_error" } : { isConnectionError: !1, isToolError: !0, category: "unknown_tool_error" };
}
async function Ko() {
  Ke("extension_loaded", {}), U.debug("Extension initializing...");
  try {
    const r = await gc.get();
    U.debug("Theme initialized:", r);
  } catch (r) {
    U.warn("Error initializing theme, continuing with defaults:", r);
  }
  await xh(), await Ah();
  const s = Lt();
  U.debug("Background script initialized with server URL:", s), ft(!1), await Dh(), U.debug("Extension initialized successfully"), (async () => {
    const r = Lt();
    U.debug(`Attempting initial connection to ${r} with transport: ${Me}`);
    let a = !1;
    try {
      await Pn(r, Me), a = await Jt(), U.debug(`Initial connection attempt result: ${a ? "connected" : "failed"}`);
    } catch (t) {
      U.debug(`Initial connection attempt failed: ${t instanceof Error ? t.message : String(t)}`), a = !1;
    }
    if (ft(a), ct(a), U.debug(`Initial connection status broadcast: ${a ? "connected" : "disconnected"}`), a)
      try {
        U.debug("[Background] Server connected, fetching and broadcasting initial tools...");
        const t = await mr(r, !1, Me);
        U.debug(`Retrieved ${t.length} primitives for initial broadcast`);
        const n = gr(t);
        U.debug(`Broadcasting ${n.length} normalized initial tools`), Qr(n);
      } catch (t) {
        U.warn("[Background] Error broadcasting initial tools:", t);
      }
  })();
}
async function Pn(s, e = Me) {
  if (Kt) {
    U.debug("Connection attempt already in progress, skipping");
    return;
  }
  Kt = !0, Wt++, U.debug(
    `Attempting to connect to MCP server via ${e} (attempt ${Wt}/${Rs}): ${s}`
  );
  try {
    await Eh(s, e), U.debug("MCP client connected successfully"), ft(!0), ct(!0);
    try {
      U.debug("[Background] Connection successful, fetching and broadcasting tools...");
      const r = await mr(s, !0, e);
      U.debug(`Retrieved ${r.length} primitives after connection`);
      const a = gr(r);
      U.debug(`Broadcasting ${a.length} normalized tools after successful connection`), Qr(a);
    } catch (r) {
      U.warn("[Background] Error broadcasting tools after connection:", r);
    }
    Wt = 0;
  } catch (r) {
    const a = Th(r instanceof Error ? r : new Error(String(r)));
    if (U.warn(`MCP server connection failed (${a.category}): ${r.message || String(r)}`), U.debug("Extension will continue to function with limited capabilities"), a.isConnectionError ? (ft(!1), ct(!1, r.message || String(r))) : U.debug("Error categorized as tool-related, not updating connection status"), Wt < Rs) {
      const t = Math.min(5e3 * Wt, 15e3);
      U.debug(`Scheduling next connection attempt in ${t / 1e3} seconds...`), setTimeout(() => {
        Kt = !1, Pn(s).catch(() => {
        });
      }, t);
    } else
      U.debug("Maximum connection attempts reached. Will try again during periodic check."), Kt = !1;
  } finally {
    Wt >= Rs && (Kt = !1);
  }
}
const kh = 6e4;
setInterval(async () => {
  if (Kt)
    return;
  const s = Jo(), e = await Jt();
  if (ft(e), s !== e) {
    if (U.debug(`Connection status changed: ${s} -> ${e}`), ct(e), e)
      try {
        U.debug("[Background] Periodic check: Connection established, fetching and broadcasting tools...");
        const r = await mr(Lt(), !0, Me);
        U.debug(`Periodic check: Retrieved ${r.length} primitives`);
        const a = gr(r);
        U.debug(`Periodic check: Broadcasting ${a.length} normalized tools`), Qr(a);
      } catch (r) {
        U.warn("[Background] Error broadcasting tools after status change:", r);
      }
  } else
    ct(e);
  if (!e && !Kt) {
    Wt = 0, U.debug("Periodic check: MCP server not connected, attempting to connect");
    const r = Lt();
    try {
      U.debug("[Background] Resetting MCP client connection state for periodic recovery attempt"), Ph();
    } catch (a) {
      U.warn("[Background] Error resetting MCP connection state:", a);
    }
    Pn(r, Me).catch(() => {
    });
  }
}, kh);
setInterval(() => {
}, 6e4);
self.addEventListener("unhandledrejection", (s) => {
  U.error("Unhandled rejection in service worker:", s.reason), s.reason instanceof Error ? Wo(s.reason, "background_unhandled_rejection") : Ke("extension_error", {
    error_message: `Unhandled rejection: ${JSON.stringify(s.reason)}`,
    error_context: "background_unhandled_rejection_non_error"
  });
});
self.addEventListener("error", (s) => {
  U.error("Uncaught error in service worker:", s.error), s.error instanceof Error ? Wo(s.error, "background_uncaught_error") : Ke("extension_error", {
    error_message: `Uncaught error: ${s.message}`,
    error_context: "background_uncaught_error_non_error"
  });
});
chrome.runtime.onInstalled.addListener(async (s) => {
  U.debug("Extension installed or updated:", s.reason);
  const e = chrome.runtime.getManifest().version, r = (/* @__PURE__ */ new Date()).toISOString();
  if (s.reason === "install") {
    U.debug("Performing first-time installation setup.");
    const a = rn();
    await chrome.storage.local.set({
      installDate: r,
      version: e,
      userProperties: {
        extension_version: e,
        install_date: r,
        ...a
      }
    }), await Gt.updateUserProperties({
      extension_version: e,
      install_date: r,
      ...a
    }), Ke("extension_installed", {
      reason: s.reason,
      extension_version: e,
      ...a
    }), Le && Le.initialized && await Le.fetchConfig(!0);
  } else if (s.reason === "update") {
    const a = s.previousVersion || "unknown";
    U.debug(`Extension updated from ${a} to ${e}`);
    const t = rn();
    await chrome.storage.local.set({
      version: e,
      previousVersion: a,
      lastUpdateDate: (/* @__PURE__ */ new Date()).toISOString()
    }), await Gt.updateUserProperties({
      extension_version: e,
      previous_version: a,
      ...t
    }), Ke("extension_installed", {
      reason: s.reason,
      extension_version: e,
      previous_version: a,
      ...t
    }), Le && Le.initialized && await Le.fetchConfig(!0), setTimeout(() => {
      chrome.tabs.query({}, (n) => {
        n.forEach((o) => {
          o.id && chrome.tabs.sendMessage(o.id, {
            type: "app:version-updated",
            data: {
              oldVersion: a,
              newVersion: e,
              timestamp: Date.now()
            }
          }).catch(() => {
          });
        });
      });
    }, 1e3);
  }
});
chrome.runtime.onStartup.addListener(() => {
  U.debug("Browser startup detected."), Ke("browser_startup", {}), Ko().catch((s) => U.error("Error initializing on startup:", s));
});
Ko().then(() => {
  U.debug("Extension startup complete");
}).catch((s) => {
  U.error("Error during extension initialization:", s), U.debug("Extension will continue running with limited functionality");
});
U.debug("Background script loaded");
U.debug("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
chrome.runtime.onMessage.addListener((s, e, r) => {
  if (U.debug("[Background] Received message:", {
    type: s.type || s.command,
    origin: s.origin || "unknown",
    id: s.id,
    hasPayload: !!s.payload,
    from: e.tab ? `tab-${e.tab.id}` : "extension"
  }), s.type === "mcp:connection-status-changed" && s.origin === "mcpclient") {
    U.debug("[Background] Received connection status change from MCP client:", s.payload);
    const { isConnected: a, error: t } = s.payload;
    return ft(a), ct(a, t), !1;
  }
  return s.command === "trackAnalyticsEvent" ? s.eventName && s.eventParams ? (Ke(s.eventName, s.eventParams).then(() => r({ success: !0 })).catch((a) => {
    U.error("[Background] Error tracking analytics event from message:", a), r({ success: !1, error: a instanceof Error ? a.message : String(a) });
  }), !0) : (U.warn("[Background] Invalid trackAnalyticsEvent message received:", s), r({ success: !1, error: "Invalid eventName or eventParams" }), !1) : typeof s.type == "string" && s.type.startsWith("mcp:") ? (Ih(s, e, r), !0) : typeof s.type == "string" && s.type.startsWith("remote-config:") ? (Oh(s, e, r), !0) : (U.debug("[Background] Message not handled, ignoring:", s.type || s.command), !1);
});
async function Ih(s, e, r) {
  const a = Date.now(), t = s.type;
  try {
    let n = null;
    const o = s.payload || {};
    switch (U.debug(`Processing MCP message: ${t}`), t) {
      case "mcp:call-tool": {
        const { toolName: u, args: l, adapterName: h } = o;
        if (!u)
          throw new Error("Tool name is required");
        U.debug(`Calling tool: ${u} from adapter: ${h || "unknown"}`), n = await wh(Lt(), u, l || {}, h), U.debug(`Tool call completed: ${u}`);
        break;
      }
      case "mcp:get-connection-status": {
        U.debug("[Background] Getting current connection status");
        const u = Jo(), l = await Jt();
        U.debug(`Stored status: ${u}, Actual status: ${l}`), u !== l && (U.debug("[Background] Status mismatch detected, updating and broadcasting..."), ft(l), ct(l)), n = {
          status: l ? "connected" : "disconnected",
          isConnected: l,
          timestamp: Date.now()
        };
        break;
      }
      case "mcp:get-tools": {
        const { forceRefresh: u = !1 } = o;
        U.debug(`Getting tools (forceRefresh: ${u})`);
        try {
          const l = await mr(Lt(), u, Me);
          U.debug(`Retrieved ${l.length} primitives from server`);
          const h = gr(l);
          U.debug(`Returning ${h.length} normalized tools to content script`), n = h;
        } catch (l) {
          if (l && (l.message && l.message.includes("SSE error") || l.message && l.message.includes("Failed to fetch"))) {
            U.debug("[Background] MCP server not available, returning empty tools list");
          } else {
            U.error("[Background] Error getting tools:", l);
          }
          n = [];
        }
      }
        break;
      case "mcp:force-reconnect": {
        U.debug("[Background] Force reconnect requested via context bridge");
        try {
          ct(!1, "Reconnecting..."), U.debug("[Background] Starting force reconnection process..."), Sh();
          const u = Ki(Lt(), Me), l = new Promise(
            (f, p) => setTimeout(() => p(new Error("Reconnection timeout after 20 seconds")), 2e4)
          );
          await Promise.race([u, l]), U.debug("[Background] Force reconnect completed successfully");
          const h = await Jt();
          if (ft(h), ct(h), h)
            try {
              U.debug("[Background] Fetching tools after successful reconnection...");
              const f = await mr(Lt(), !0, Me);
              U.debug(`Retrieved ${f.length} primitives after reconnection`);
              const p = gr(f);
              U.debug(`Broadcasting ${p.length} normalized tools after reconnection`), Qr(p);
            } catch (f) {
              U.error("[Background] Error fetching tools after reconnect:", f);
            }
          n = { isConnected: h, message: "Reconnection completed" };
        } catch (u) {
          U.error("[Background] Force reconnect failed:", u);
          const l = await Jt();
          ft(l);
          const h = u instanceof Error ? u.message : String(u);
          ct(l, h), n = { isConnected: l, error: h };
        }
        break;
      }
      case "mcp:get-server-config": {
        const u = await chrome.storage.local.get(["mcpServerUrl", "mcpConnectionType"]), l = Me === "websocket" ? Qo : ba;
        n = {
          uri: u.mcpServerUrl || l,
          connectionType: u.mcpConnectionType || Me
        };
        break;
      }
      case "mcp:update-server-config": {
        const { config: u } = o;
        if (!u || typeof u.uri != "string")
          throw new Error("Invalid server config: uri is required");
        let l = u.connectionType;
        if (U.debug(`Received connection type: ${u.connectionType}, parsed as: ${l}`), !l)
          try {
            const f = new URL(u.uri);
            l = f.protocol === "ws:" || f.protocol === "wss:" ? "websocket" : "sse";
          } catch {
            l = Me;
          }
        U.debug(`Updating server config to: ${u.uri} (${l})`), await chrome.storage.local.set({
          mcpServerUrl: u.uri,
          mcpConnectionType: l
        }), Rh(u.uri, l), $h({ uri: u.uri, connectionType: l }), (async () => {
          try {
            U.debug("[Background] Starting async reconnection after config update..."), await Ki(u.uri, l);
            const f = await Jt();
            if (ft(f), ct(f), U.debug(`Async reconnection completed, connected: ${f}`), f)
              try {
                const p = await mr(u.uri, !0, l), d = gr(p);
                Qr(d), U.debug(`Broadcasted ${d.length} normalized tools after config update`);
              } catch (p) {
                U.warn("[Background] Failed to fetch tools after config update:", p);
              }
          } catch (f) {
            U.warn("[Background] Async reconnect after config update failed:", f);
            const p = await Jt();
            ft(p);
            const d = f instanceof Error ? f.message : String(f);
            ct(p, d);
          }
        })().catch((f) => {
          U.error("[Background] Unhandled error in async reconnection:", f);
        }), n = { success: !0 };
        break;
      }
      case "mcp:heartbeat": {
        const { timestamp: u } = o, l = bh();
        n = {
          timestamp: Date.now(),
          isConnected: l,
          receivedTimestamp: u
        }, s.id && setTimeout(() => {
          chrome.tabs.query({}, (h) => {
            h.forEach((f) => {
              f.id && chrome.tabs.sendMessage(f.id, {
                type: "mcp:heartbeat-response",
                payload: { timestamp: Date.now(), isConnected: l },
                origin: "background",
                timestamp: Date.now()
              }).catch(() => {
              });
            });
          });
        }, 0);
        break;
      }
      default:
        throw new Error(`Unhandled MCP message type: ${t}`);
    }
    const i = Date.now() - a;
    U.debug(`MCP message ${t} processed in ${i}ms`), r({
      type: `${t}:response`,
      payload: n,
      success: !0,
      timestamp: Date.now(),
      processingTime: i,
      origin: "background",
      id: s.id
    });
  } catch (n) {
    const o = Date.now() - a, i = n instanceof Error ? n.message : String(n);
    U.error(`MCP message handling error (${o}ms):`, n), r({
      type: `${t}:response`,
      error: i,
      success: !1,
      timestamp: Date.now(),
      processingTime: o,
      origin: "background",
      id: s.id
    });
  }
}
function ct(s, e) {
  const r = e ? "error" : s ? "connected" : "disconnected";
  U.debug(`Broadcasting connection status: ${r} (connected: ${s})`);
  const a = {
    type: "connection:status-changed",
    payload: {
      status: r,
      // Type assertion needed due to status calculation
      error: e || void 0,
      isConnected: s,
      timestamp: Date.now()
    },
    origin: "background",
    timestamp: Date.now()
  };
  chrome.tabs.query({}, (t) => {
    t.forEach((n) => {
      n.id && chrome.tabs.sendMessage(n.id, a).catch(() => {
      });
    });
  });
}
function Qr(s) {
  U.debug(`Broadcasting tools update to content scripts: ${s.length} tools`);
  const e = {
    type: "mcp:tool-update",
    payload: {
      tools: s
    },
    origin: "background",
    timestamp: Date.now()
  };
  chrome.tabs.query({}, (r) => {
    r.forEach((a) => {
      a.id && chrome.tabs.sendMessage(a.id, e).catch(() => {
      });
    });
  });
}
function $h(s) {
  U.debug(`Broadcasting config update to content scripts: ${s.uri}`);
  const e = {
    type: "mcp:server-config-updated",
    payload: {
      config: s
      // Type assertion due to partial config structure
    },
    origin: "background",
    timestamp: Date.now()
  };
  chrome.tabs.query({}, (r) => {
    r.forEach((a) => {
      a.id && chrome.tabs.sendMessage(a.id, e).catch(() => {
      });
    });
  });
}
async function Oh(s, e, r) {
  const a = Date.now();
  try {
    if (U.debug(`Processing Remote Config message: ${s.type}`), !Le || !Le.isInitialized)
      throw new Error("Remote Config Manager not initialized");
    let t = null;
    switch (s.type) {
      case "remote-config:fetch": {
        const { force: o = !1 } = s.payload || {};
        U.debug(`Fetching remote config (force: ${o})`), await Le.fetchConfig(o), t = { success: !0, timestamp: Date.now() };
        break;
      }
      case "remote-config:get-feature-flag": {
        const { flagName: o } = s.payload || {};
        if (!o)
          throw new Error("Feature flag name is required");
        U.debug(`Getting feature flag: ${o}`), t = await Le.getFeatureFlag(o);
        break;
      }
      case "remote-config:get-config": {
        const { key: o } = s.payload || {};
        o ? (U.debug(`Getting specific config for key: ${o}`), t = await Le.getSpecificConfig(o)) : (U.debug("[Background] Getting all remote config"), t = await Le.getAllConfig());
        break;
      }
      case "remote-config:get-status": {
        U.debug("[Background] Getting remote config status"), t = {
          initialized: Le.initialized,
          lastFetchTime: await Le.getLastFetchTimePublic(),
          timestamp: Date.now()
        };
        break;
      }
      case "remote-config:clear-cache": {
        U.debug("[Background] Clearing remote config cache and refreshing"), t = {
          success: await Le.clearCacheAndRefresh(),
          timestamp: Date.now()
        };
        break;
      }
      default:
        throw new Error(`Unknown remote config message type: ${s.type}`);
    }
    const n = {
      success: !0,
      data: t,
      processingTime: Date.now() - a,
      timestamp: Date.now()
    };
    U.debug(`Remote Config message processed successfully: ${s.type} (${n.processingTime}ms)`), r(n);
  } catch (t) {
    const n = t instanceof Error ? t.message : String(t);
    U.error(`Error processing Remote Config message ${s.type}:`, t);
    const o = {
      success: !1,
      error: n,
      processingTime: Date.now() - a,
      timestamp: Date.now()
    };
    r(o);
  }
}
async function Dh() {
  try {
    Le = new wc(), await Le.initialize(), U.debug("[Background] Remote Config Manager initialized successfully"), typeof globalThis < "u" && (globalThis.remoteConfigManager = Le, U.debug("[Background] RemoteConfigManager is now accessible globally as window.remoteConfigManager"));
  } catch (s) {
    U.error("[Background] Failed to initialize Remote Config Manager:", s);
  }
}
Dh().catch((s) => U.error("[Background] Failed to initialize Remote Config Manager on startup:", s));

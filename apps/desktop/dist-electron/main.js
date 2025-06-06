var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var _validatedData, _matchResult, _HonoRequest_instances, getDecodedParam_fn, getAllDecodedParams_fn, getParamValue_fn, _cachedBody, _a, _rawRequest, _req, _var, _status, _executionCtx, _headers, _preparedHeaders, _res, _isFresh, _layout, _renderer, _notFoundHandler, _matchResult2, _path, _Context_instances, newResponse_fn, _b, _path2, _Hono_instances, clone_fn, _notFoundHandler2, addRoute_fn, handleError_fn, dispatch_fn, _c, _index, _varIndex, _children, _d, _context, _root, _e, _middleware, _routes, _RegExpRouter_instances, buildAllMatchers_fn, buildMatcher_fn, _f, _routers, _routes2, _g, _methods, _children2, _patterns, _order, _params, _Node_instances, getHandlerSets_fn, _h, _node, _i, _body, _init, _j;
import { app as app$1, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import { createServer } from "http";
import { Http2ServerRequest } from "http2";
import { Readable } from "stream";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import require$$0 from "os";
import require$$1 from "util";
import require$$2 from "events";
import require$$0$1 from "buffer";
import require$$1$1 from "dgram";
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError2 = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError2 = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError2)) {
        context.res = res;
      }
      return context;
    }
  };
};
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if ((contentType == null ? void 0 : contentType.startsWith("multipart/form-data")) || (contentType == null ? void 0 : contentType.startsWith("application/x-www-form-urlencoded"))) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    form[key] = value;
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys3 = key.split(".");
  keys3.forEach((key2, index) => {
    if (index === keys3.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};
var splitPath = (path2) => {
  const paths = path2.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path: path2 } = extractGroupsFromPath(routePath);
  const paths = splitPath(path2);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path2) => {
  const groups = [];
  path2 = path2.replace(/\{[^}]+\}/g, (match, index) => {
    const mark = `@${index}`;
    groups.push([mark, match]);
    return mark;
  });
  return { groups, path: path2 };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match) {
    const cacheKey2 = `${label}#${next}`;
    if (!patternCache[cacheKey2]) {
      if (match[2]) {
        patternCache[cacheKey2] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey2, match[1], new RegExp(`^${match[2]}(?=/${next})`)] : [label, match[1], new RegExp(`^${match[2]}$`)];
      } else {
        patternCache[cacheKey2] = [label, match[1], true];
      }
    }
    return patternCache[cacheKey2];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match) => {
      try {
        return decoder(match);
      } catch {
        return match;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start2 = url.indexOf("/", 8);
  let i = start2;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path2 = url.slice(start2, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path2.includes("%25") ? path2.replace(/%25/g, "%2525") : path2);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start2, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${(base == null ? void 0 : base[0]) === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${(base == null ? void 0 : base.at(-1)) === "/" ? "" : "/"}${(sub == null ? void 0 : sub[0]) === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path2) => {
  if (path2.charCodeAt(path2.length - 1) !== 63 || !path2.includes(":")) {
    return null;
  }
  const segments = path2.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? decodeURIComponent_(value) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf(`?${key}`, 8);
    if (keyIndex2 === -1) {
      keyIndex2 = url.indexOf(`&${key}`, 8);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ?? (encoded = /[%+]/.test(url));
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      results[name].push(value);
    } else {
      results[name] ?? (results[name] = value);
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = (_a = class {
  constructor(request, path2 = "/", matchResult = [[]]) {
    __privateAdd(this, _HonoRequest_instances);
    __publicField(this, "raw");
    __privateAdd(this, _validatedData);
    __privateAdd(this, _matchResult);
    __publicField(this, "routeIndex", 0);
    __publicField(this, "path");
    __publicField(this, "bodyCache", {});
    __privateAdd(this, _cachedBody, (key) => {
      const { bodyCache, raw } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody) {
        return cachedBody;
      }
      const anyCachedKey = Object.keys(bodyCache)[0];
      if (anyCachedKey) {
        return bodyCache[anyCachedKey].then((body) => {
          if (anyCachedKey === "json") {
            body = JSON.stringify(body);
          }
          return new Response(body)[key]();
        });
      }
      return bodyCache[key] = raw[key]();
    });
    this.raw = request;
    this.path = path2;
    __privateSet(this, _matchResult, matchResult);
    __privateSet(this, _validatedData, {});
  }
  param(key) {
    return key ? __privateMethod(this, _HonoRequest_instances, getDecodedParam_fn).call(this, key) : __privateMethod(this, _HonoRequest_instances, getAllDecodedParams_fn).call(this);
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    var _a2;
    return (_a2 = this.bodyCache).parsedBody ?? (_a2.parsedBody = await parseBody(this, options));
  }
  json() {
    return __privateGet(this, _cachedBody).call(this, "json");
  }
  text() {
    return __privateGet(this, _cachedBody).call(this, "text");
  }
  arrayBuffer() {
    return __privateGet(this, _cachedBody).call(this, "arrayBuffer");
  }
  blob() {
    return __privateGet(this, _cachedBody).call(this, "blob");
  }
  formData() {
    return __privateGet(this, _cachedBody).call(this, "formData");
  }
  addValidatedData(target, data) {
    __privateGet(this, _validatedData)[target] = data;
  }
  valid(target) {
    return __privateGet(this, _validatedData)[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get matchedRoutes() {
    return __privateGet(this, _matchResult)[0].map(([[, route]]) => route);
  }
  get routePath() {
    return __privateGet(this, _matchResult)[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, _validatedData = new WeakMap(), _matchResult = new WeakMap(), _HonoRequest_instances = new WeakSet(), getDecodedParam_fn = function(key) {
  const paramKey = __privateGet(this, _matchResult)[0][this.routeIndex][1][key];
  const param = __privateMethod(this, _HonoRequest_instances, getParamValue_fn).call(this, paramKey);
  return param ? /\%/.test(param) ? tryDecodeURIComponent(param) : param : void 0;
}, getAllDecodedParams_fn = function() {
  const decoded = {};
  const keys3 = Object.keys(__privateGet(this, _matchResult)[0][this.routeIndex][1]);
  for (const key of keys3) {
    const value = __privateMethod(this, _HonoRequest_instances, getParamValue_fn).call(this, __privateGet(this, _matchResult)[0][this.routeIndex][1][key]);
    if (value && typeof value === "string") {
      decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
    }
  }
  return decoded;
}, getParamValue_fn = function(paramKey) {
  return __privateGet(this, _matchResult)[1] ? __privateGet(this, _matchResult)[1][paramKey] : paramKey;
}, _cachedBody = new WeakMap(), _a);
var HtmlEscapedCallbackPhase = {
  Stringify: 1
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!(callbacks == null ? void 0 : callbacks.length)) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  {
    return resStr;
  }
};
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setHeaders = (headers, map = {}) => {
  for (const key of Object.keys(map)) {
    headers.set(key, map[key]);
  }
  return headers;
};
var Context = (_b = class {
  constructor(req, options) {
    __privateAdd(this, _Context_instances);
    __privateAdd(this, _rawRequest);
    __privateAdd(this, _req);
    __publicField(this, "env", {});
    __privateAdd(this, _var);
    __publicField(this, "finalized", false);
    __publicField(this, "error");
    __privateAdd(this, _status, 200);
    __privateAdd(this, _executionCtx);
    __privateAdd(this, _headers);
    __privateAdd(this, _preparedHeaders);
    __privateAdd(this, _res);
    __privateAdd(this, _isFresh, true);
    __privateAdd(this, _layout);
    __privateAdd(this, _renderer);
    __privateAdd(this, _notFoundHandler);
    __privateAdd(this, _matchResult2);
    __privateAdd(this, _path);
    __publicField(this, "render", (...args) => {
      __privateGet(this, _renderer) ?? __privateSet(this, _renderer, (content) => this.html(content));
      return __privateGet(this, _renderer).call(this, ...args);
    });
    __publicField(this, "setLayout", (layout) => __privateSet(this, _layout, layout));
    __publicField(this, "getLayout", () => __privateGet(this, _layout));
    __publicField(this, "setRenderer", (renderer) => {
      __privateSet(this, _renderer, renderer);
    });
    __publicField(this, "header", (name, value, options) => {
      if (this.finalized) {
        __privateSet(this, _res, new Response(__privateGet(this, _res).body, __privateGet(this, _res)));
      }
      if (value === void 0) {
        if (__privateGet(this, _headers)) {
          __privateGet(this, _headers).delete(name);
        } else if (__privateGet(this, _preparedHeaders)) {
          delete __privateGet(this, _preparedHeaders)[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options == null ? void 0 : options.append) {
        if (!__privateGet(this, _headers)) {
          __privateSet(this, _isFresh, false);
          __privateSet(this, _headers, new Headers(__privateGet(this, _preparedHeaders)));
          __privateSet(this, _preparedHeaders, {});
        }
        __privateGet(this, _headers).append(name, value);
      } else {
        if (__privateGet(this, _headers)) {
          __privateGet(this, _headers).set(name, value);
        } else {
          __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
          __privateGet(this, _preparedHeaders)[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options == null ? void 0 : options.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    });
    __publicField(this, "status", (status) => {
      __privateSet(this, _isFresh, false);
      __privateSet(this, _status, status);
    });
    __publicField(this, "set", (key, value) => {
      __privateGet(this, _var) ?? __privateSet(this, _var, /* @__PURE__ */ new Map());
      __privateGet(this, _var).set(key, value);
    });
    __publicField(this, "get", (key) => {
      return __privateGet(this, _var) ? __privateGet(this, _var).get(key) : void 0;
    });
    __publicField(this, "newResponse", (...args) => __privateMethod(this, _Context_instances, newResponse_fn).call(this, ...args));
    __publicField(this, "body", (data, arg, headers) => {
      return typeof arg === "number" ? __privateMethod(this, _Context_instances, newResponse_fn).call(this, data, arg, headers) : __privateMethod(this, _Context_instances, newResponse_fn).call(this, data, arg);
    });
    __publicField(this, "text", (text, arg, headers) => {
      if (!__privateGet(this, _preparedHeaders)) {
        if (__privateGet(this, _isFresh) && !headers && !arg) {
          return new Response(text);
        }
        __privateSet(this, _preparedHeaders, {});
      }
      __privateGet(this, _preparedHeaders)["content-type"] = TEXT_PLAIN;
      if (typeof arg === "number") {
        return __privateMethod(this, _Context_instances, newResponse_fn).call(this, text, arg, headers);
      }
      return __privateMethod(this, _Context_instances, newResponse_fn).call(this, text, arg);
    });
    __publicField(this, "json", (object, arg, headers) => {
      const body = JSON.stringify(object);
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _preparedHeaders)["content-type"] = "application/json";
      return typeof arg === "number" ? __privateMethod(this, _Context_instances, newResponse_fn).call(this, body, arg, headers) : __privateMethod(this, _Context_instances, newResponse_fn).call(this, body, arg);
    });
    __publicField(this, "html", (html, arg, headers) => {
      __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
      __privateGet(this, _preparedHeaders)["content-type"] = "text/html; charset=UTF-8";
      if (typeof html === "object") {
        return resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then((html2) => {
          return typeof arg === "number" ? __privateMethod(this, _Context_instances, newResponse_fn).call(this, html2, arg, headers) : __privateMethod(this, _Context_instances, newResponse_fn).call(this, html2, arg);
        });
      }
      return typeof arg === "number" ? __privateMethod(this, _Context_instances, newResponse_fn).call(this, html, arg, headers) : __privateMethod(this, _Context_instances, newResponse_fn).call(this, html, arg);
    });
    __publicField(this, "redirect", (location, status) => {
      __privateGet(this, _headers) ?? __privateSet(this, _headers, new Headers());
      __privateGet(this, _headers).set("Location", String(location));
      return this.newResponse(null, status ?? 302);
    });
    __publicField(this, "notFound", () => {
      __privateGet(this, _notFoundHandler) ?? __privateSet(this, _notFoundHandler, () => new Response());
      return __privateGet(this, _notFoundHandler).call(this, this);
    });
    __privateSet(this, _rawRequest, req);
    if (options) {
      __privateSet(this, _executionCtx, options.executionCtx);
      this.env = options.env;
      __privateSet(this, _notFoundHandler, options.notFoundHandler);
      __privateSet(this, _path, options.path);
      __privateSet(this, _matchResult2, options.matchResult);
    }
  }
  get req() {
    __privateGet(this, _req) ?? __privateSet(this, _req, new HonoRequest(__privateGet(this, _rawRequest), __privateGet(this, _path), __privateGet(this, _matchResult2)));
    return __privateGet(this, _req);
  }
  get event() {
    if (__privateGet(this, _executionCtx) && "respondWith" in __privateGet(this, _executionCtx)) {
      return __privateGet(this, _executionCtx);
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (__privateGet(this, _executionCtx)) {
      return __privateGet(this, _executionCtx);
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    __privateSet(this, _isFresh, false);
    return __privateGet(this, _res) || __privateSet(this, _res, new Response("404 Not Found", { status: 404 }));
  }
  set res(_res2) {
    __privateSet(this, _isFresh, false);
    if (__privateGet(this, _res) && _res2) {
      _res2 = new Response(_res2.body, _res2);
      for (const [k, v] of __privateGet(this, _res).headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = __privateGet(this, _res).headers.getSetCookie();
          _res2.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res2.headers.append("set-cookie", cookie);
          }
        } else {
          _res2.headers.set(k, v);
        }
      }
    }
    __privateSet(this, _res, _res2);
    this.finalized = true;
  }
  get var() {
    if (!__privateGet(this, _var)) {
      return {};
    }
    return Object.fromEntries(__privateGet(this, _var));
  }
}, _rawRequest = new WeakMap(), _req = new WeakMap(), _var = new WeakMap(), _status = new WeakMap(), _executionCtx = new WeakMap(), _headers = new WeakMap(), _preparedHeaders = new WeakMap(), _res = new WeakMap(), _isFresh = new WeakMap(), _layout = new WeakMap(), _renderer = new WeakMap(), _notFoundHandler = new WeakMap(), _matchResult2 = new WeakMap(), _path = new WeakMap(), _Context_instances = new WeakSet(), newResponse_fn = function(data, arg, headers) {
  if (__privateGet(this, _isFresh) && !headers && !arg && __privateGet(this, _status) === 200) {
    return new Response(data, {
      headers: __privateGet(this, _preparedHeaders)
    });
  }
  if (arg && typeof arg !== "number") {
    const header = new Headers(arg.headers);
    if (__privateGet(this, _headers)) {
      __privateGet(this, _headers).forEach((v, k) => {
        if (k === "set-cookie") {
          header.append(k, v);
        } else {
          header.set(k, v);
        }
      });
    }
    const headers2 = setHeaders(header, __privateGet(this, _preparedHeaders));
    return new Response(data, {
      headers: headers2,
      status: arg.status ?? __privateGet(this, _status)
    });
  }
  const status = typeof arg === "number" ? arg : __privateGet(this, _status);
  __privateGet(this, _preparedHeaders) ?? __privateSet(this, _preparedHeaders, {});
  __privateGet(this, _headers) ?? __privateSet(this, _headers, new Headers());
  setHeaders(__privateGet(this, _headers), __privateGet(this, _preparedHeaders));
  if (__privateGet(this, _res)) {
    __privateGet(this, _res).headers.forEach((v, k) => {
      var _a2, _b2;
      if (k === "set-cookie") {
        (_a2 = __privateGet(this, _headers)) == null ? void 0 : _a2.append(k, v);
      } else {
        (_b2 = __privateGet(this, _headers)) == null ? void 0 : _b2.set(k, v);
      }
    });
    setHeaders(__privateGet(this, _headers), __privateGet(this, _preparedHeaders));
  }
  headers ?? (headers = {});
  for (const [k, v] of Object.entries(headers)) {
    if (typeof v === "string") {
      __privateGet(this, _headers).set(k, v);
    } else {
      __privateGet(this, _headers).delete(k);
      for (const v2 of v) {
        __privateGet(this, _headers).append(k, v2);
      }
    }
  }
  return new Response(data, {
    status,
    headers: __privateGet(this, _headers)
  });
}, _b);
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono$1 = (_c = class {
  constructor(options = {}) {
    __privateAdd(this, _Hono_instances);
    __publicField(this, "get");
    __publicField(this, "post");
    __publicField(this, "put");
    __publicField(this, "delete");
    __publicField(this, "options");
    __publicField(this, "patch");
    __publicField(this, "all");
    __publicField(this, "on");
    __publicField(this, "use");
    __publicField(this, "router");
    __publicField(this, "getPath");
    __publicField(this, "_basePath", "/");
    __privateAdd(this, _path2, "/");
    __publicField(this, "routes", []);
    __privateAdd(this, _notFoundHandler2, notFoundHandler);
    __publicField(this, "errorHandler", errorHandler);
    __publicField(this, "onError", (handler) => {
      this.errorHandler = handler;
      return this;
    });
    __publicField(this, "notFound", (handler) => {
      __privateSet(this, _notFoundHandler2, handler);
      return this;
    });
    __publicField(this, "fetch", (request, ...rest) => {
      return __privateMethod(this, _Hono_instances, dispatch_fn).call(this, request, rest[1], rest[0], request.method);
    });
    __publicField(this, "request", (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
      }
      input = input.toString();
      return this.fetch(
        new Request(
          /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
          requestInit
        ),
        Env,
        executionCtx
      );
    });
    __publicField(this, "fire", () => {
      addEventListener("fetch", (event) => {
        event.respondWith(__privateMethod(this, _Hono_instances, dispatch_fn).call(this, event.request, event, void 0, event.request.method));
      });
    });
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          __privateSet(this, _path2, args1);
        } else {
          __privateMethod(this, _Hono_instances, addRoute_fn).call(this, method, __privateGet(this, _path2), args1);
        }
        args.forEach((handler) => {
          __privateMethod(this, _Hono_instances, addRoute_fn).call(this, method, __privateGet(this, _path2), handler);
        });
        return this;
      };
    });
    this.on = (method, path2, ...handlers) => {
      for (const p of [path2].flat()) {
        __privateSet(this, _path2, p);
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            __privateMethod(this, _Hono_instances, addRoute_fn).call(this, m.toUpperCase(), __privateGet(this, _path2), handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        __privateSet(this, _path2, arg1);
      } else {
        __privateSet(this, _path2, "*");
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        __privateMethod(this, _Hono_instances, addRoute_fn).call(this, METHOD_NAME_ALL, __privateGet(this, _path2), handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  route(path2, app2) {
    const subApp = this.basePath(path2);
    app2.routes.map((r2) => {
      var _a2;
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r2.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r2.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r2.handler;
      }
      __privateMethod(_a2 = subApp, _Hono_instances, addRoute_fn).call(_a2, r2.method, r2.path, handler);
    });
    return this;
  }
  basePath(path2) {
    const subApp = __privateMethod(this, _Hono_instances, clone_fn).call(this);
    subApp._basePath = mergePath(this._basePath, path2);
    return subApp;
  }
  mount(path2, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest || (replaceRequest = (() => {
      const mergedPath = mergePath(this._basePath, path2);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })());
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    __privateMethod(this, _Hono_instances, addRoute_fn).call(this, METHOD_NAME_ALL, mergePath(path2, "*"), handler);
    return this;
  }
}, _path2 = new WeakMap(), _Hono_instances = new WeakSet(), clone_fn = function() {
  const clone = new Hono$1({
    router: this.router,
    getPath: this.getPath
  });
  clone.errorHandler = this.errorHandler;
  __privateSet(clone, _notFoundHandler2, __privateGet(this, _notFoundHandler2));
  clone.routes = this.routes;
  return clone;
}, _notFoundHandler2 = new WeakMap(), addRoute_fn = function(method, path2, handler) {
  method = method.toUpperCase();
  path2 = mergePath(this._basePath, path2);
  const r2 = { path: path2, method, handler };
  this.router.add(method, path2, [handler, r2]);
  this.routes.push(r2);
}, handleError_fn = function(err, c) {
  if (err instanceof Error) {
    return this.errorHandler(err, c);
  }
  throw err;
}, dispatch_fn = function(request, executionCtx, env, method) {
  if (method === "HEAD") {
    return (async () => new Response(null, await __privateMethod(this, _Hono_instances, dispatch_fn).call(this, request, executionCtx, env, "GET")))();
  }
  const path2 = this.getPath(request, { env });
  const matchResult = this.router.match(method, path2);
  const c = new Context(request, {
    path: path2,
    matchResult,
    env,
    executionCtx,
    notFoundHandler: __privateGet(this, _notFoundHandler2)
  });
  if (matchResult[0].length === 1) {
    let res;
    try {
      res = matchResult[0][0][0][0](c, async () => {
        c.res = await __privateGet(this, _notFoundHandler2).call(this, c);
      });
    } catch (err) {
      return __privateMethod(this, _Hono_instances, handleError_fn).call(this, err, c);
    }
    return res instanceof Promise ? res.then(
      (resolved) => resolved || (c.finalized ? c.res : __privateGet(this, _notFoundHandler2).call(this, c))
    ).catch((err) => __privateMethod(this, _Hono_instances, handleError_fn).call(this, err, c)) : res ?? __privateGet(this, _notFoundHandler2).call(this, c);
  }
  const composed = compose(matchResult[0], this.errorHandler, __privateGet(this, _notFoundHandler2));
  return (async () => {
    try {
      const context = await composed(c);
      if (!context.finalized) {
        throw new Error(
          "Context is not finalized. Did you forget to return a Response object or `await next()`?"
        );
      }
      return context.res;
    } catch (err) {
      return __privateMethod(this, _Hono_instances, handleError_fn).call(this, err, c);
    }
  })();
}, _c);
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node$1 = (_d = class {
  constructor() {
    __privateAdd(this, _index);
    __privateAdd(this, _varIndex);
    __privateAdd(this, _children, /* @__PURE__ */ Object.create(null));
  }
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (__privateGet(this, _index) !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      __privateSet(this, _index, index);
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = __privateGet(this, _children)[regexpStr];
      if (!node) {
        if (Object.keys(__privateGet(this, _children)).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = __privateGet(this, _children)[regexpStr] = new Node$1();
        if (name !== "") {
          __privateSet(node, _varIndex, context.varIndex++);
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, __privateGet(node, _varIndex)]);
      }
    } else {
      node = __privateGet(this, _children)[token];
      if (!node) {
        if (Object.keys(__privateGet(this, _children)).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = __privateGet(this, _children)[token] = new Node$1();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(__privateGet(this, _children)).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = __privateGet(this, _children)[k];
      return (typeof __privateGet(c, _varIndex) === "number" ? `(${k})@${__privateGet(c, _varIndex)}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof __privateGet(this, _index) === "number") {
      strList.unshift(`#${__privateGet(this, _index)}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, _index = new WeakMap(), _varIndex = new WeakMap(), _children = new WeakMap(), _d);
var Trie = (_e = class {
  constructor() {
    __privateAdd(this, _context, { varIndex: 0 });
    __privateAdd(this, _root, new Node$1());
  }
  insert(path2, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path2 = path2.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path2.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    __privateGet(this, _root).insert(tokens, index, paramAssoc, __privateGet(this, _context), pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = __privateGet(this, _root).buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, _context = new WeakMap(), _root = new WeakMap(), _e);
var emptyParam = [];
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path2) {
  return wildcardRegExpCache[path2] ?? (wildcardRegExpCache[path2] = new RegExp(
    path2 === "*" ? "" : `^${path2.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  ));
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  var _a2;
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path2, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path2] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path2, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path2) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = (_a2 = handlerData[i][j]) == null ? void 0 : _a2[1];
      if (!map) {
        continue;
      }
      const keys3 = Object.keys(map);
      for (let k = 0, len3 = keys3.length; k < len3; k++) {
        map[keys3[k]] = paramReplacementMap[map[keys3[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path2) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path2)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = (_f = class {
  constructor() {
    __privateAdd(this, _RegExpRouter_instances);
    __publicField(this, "name", "RegExpRouter");
    __privateAdd(this, _middleware);
    __privateAdd(this, _routes);
    __privateSet(this, _middleware, { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) });
    __privateSet(this, _routes, { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) });
  }
  add(method, path2, handler) {
    var _a2;
    const middleware = __privateGet(this, _middleware);
    const routes = __privateGet(this, _routes);
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path2 === "/*") {
      path2 = "*";
    }
    const paramCount = (path2.match(/\/:/g) || []).length;
    if (/\*$/.test(path2)) {
      const re = buildWildcardRegExp(path2);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          var _a3;
          (_a3 = middleware[m])[path2] || (_a3[path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []);
        });
      } else {
        (_a2 = middleware[method])[path2] || (_a2[path2] = findMiddleware(middleware[method], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []);
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path2) || [path2];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path22 = paths[i];
      Object.keys(routes).forEach((m) => {
        var _a3;
        if (method === METHOD_NAME_ALL || method === m) {
          (_a3 = routes[m])[path22] || (_a3[path22] = [
            ...findMiddleware(middleware[m], path22) || findMiddleware(middleware[METHOD_NAME_ALL], path22) || []
          ]);
          routes[m][path22].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match(method, path2) {
    clearWildcardRegExpCache();
    const matchers = __privateMethod(this, _RegExpRouter_instances, buildAllMatchers_fn).call(this);
    this.match = (method2, path22) => {
      const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
      const staticMatch = matcher[2][path22];
      if (staticMatch) {
        return staticMatch;
      }
      const match = path22.match(matcher[0]);
      if (!match) {
        return [[], emptyParam];
      }
      const index = match.indexOf("", 1);
      return [matcher[1][index], match];
    };
    return this.match(method, path2);
  }
}, _middleware = new WeakMap(), _routes = new WeakMap(), _RegExpRouter_instances = new WeakSet(), buildAllMatchers_fn = function() {
  const matchers = /* @__PURE__ */ Object.create(null);
  Object.keys(__privateGet(this, _routes)).concat(Object.keys(__privateGet(this, _middleware))).forEach((method) => {
    matchers[method] || (matchers[method] = __privateMethod(this, _RegExpRouter_instances, buildMatcher_fn).call(this, method));
  });
  __privateSet(this, _middleware, __privateSet(this, _routes, void 0));
  return matchers;
}, buildMatcher_fn = function(method) {
  const routes = [];
  let hasOwnRoute = method === METHOD_NAME_ALL;
  [__privateGet(this, _middleware), __privateGet(this, _routes)].forEach((r2) => {
    const ownRoute = r2[method] ? Object.keys(r2[method]).map((path2) => [path2, r2[method][path2]]) : [];
    if (ownRoute.length !== 0) {
      hasOwnRoute || (hasOwnRoute = true);
      routes.push(...ownRoute);
    } else if (method !== METHOD_NAME_ALL) {
      routes.push(
        ...Object.keys(r2[METHOD_NAME_ALL]).map((path2) => [path2, r2[METHOD_NAME_ALL][path2]])
      );
    }
  });
  if (!hasOwnRoute) {
    return null;
  } else {
    return buildMatcherFromPreprocessedRoutes(routes);
  }
}, _f);
var SmartRouter = (_g = class {
  constructor(init) {
    __publicField(this, "name", "SmartRouter");
    __privateAdd(this, _routers, []);
    __privateAdd(this, _routes2, []);
    __privateSet(this, _routers, init.routers);
  }
  add(method, path2, handler) {
    if (!__privateGet(this, _routes2)) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    __privateGet(this, _routes2).push([method, path2, handler]);
  }
  match(method, path2) {
    if (!__privateGet(this, _routes2)) {
      throw new Error("Fatal error");
    }
    const routers = __privateGet(this, _routers);
    const routes = __privateGet(this, _routes2);
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path2);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      __privateSet(this, _routers, [router]);
      __privateSet(this, _routes2, void 0);
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (__privateGet(this, _routes2) || __privateGet(this, _routers).length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return __privateGet(this, _routers)[0];
  }
}, _routers = new WeakMap(), _routes2 = new WeakMap(), _g);
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node = (_h = class {
  constructor(method, handler, children) {
    __privateAdd(this, _Node_instances);
    __privateAdd(this, _methods);
    __privateAdd(this, _children2);
    __privateAdd(this, _patterns);
    __privateAdd(this, _order, 0);
    __privateAdd(this, _params, emptyParams);
    __privateSet(this, _children2, children || /* @__PURE__ */ Object.create(null));
    __privateSet(this, _methods, []);
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      __privateSet(this, _methods, [m]);
    }
    __privateSet(this, _patterns, []);
  }
  insert(method, path2, handler) {
    __privateSet(this, _order, ++__privateWrapper(this, _order)._);
    let curNode = this;
    const parts = splitRoutingPath(path2);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (Object.keys(__privateGet(curNode, _children2)).includes(key)) {
        curNode = __privateGet(curNode, _children2)[key];
        const pattern2 = getPattern(p, nextP);
        if (pattern2) {
          possibleKeys.push(pattern2[1]);
        }
        continue;
      }
      __privateGet(curNode, _children2)[key] = new Node();
      if (pattern) {
        __privateGet(curNode, _patterns).push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = __privateGet(curNode, _children2)[key];
    }
    const m = /* @__PURE__ */ Object.create(null);
    const handlerSet = {
      handler,
      possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
      score: __privateGet(this, _order)
    };
    m[method] = handlerSet;
    __privateGet(curNode, _methods).push(m);
    return curNode;
  }
  search(method, path2) {
    var _a2;
    const handlerSets = [];
    __privateSet(this, _params, emptyParams);
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path2);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = __privateGet(node, _children2)[part];
        if (nextNode) {
          __privateSet(nextNode, _params, __privateGet(node, _params));
          if (isLast) {
            if (__privateGet(nextNode, _children2)["*"]) {
              handlerSets.push(
                ...__privateMethod(this, _Node_instances, getHandlerSets_fn).call(this, __privateGet(nextNode, _children2)["*"], method, __privateGet(node, _params))
              );
            }
            handlerSets.push(...__privateMethod(this, _Node_instances, getHandlerSets_fn).call(this, nextNode, method, __privateGet(node, _params)));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = __privateGet(node, _patterns).length; k < len3; k++) {
          const pattern = __privateGet(node, _patterns)[k];
          const params = __privateGet(node, _params) === emptyParams ? {} : { ...__privateGet(node, _params) };
          if (pattern === "*") {
            const astNode = __privateGet(node, _children2)["*"];
            if (astNode) {
              handlerSets.push(...__privateMethod(this, _Node_instances, getHandlerSets_fn).call(this, astNode, method, __privateGet(node, _params)));
              __privateSet(astNode, _params, params);
              tempNodes.push(astNode);
            }
            continue;
          }
          if (part === "") {
            continue;
          }
          const [key, name, matcher] = pattern;
          const child = __privateGet(node, _children2)[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...__privateMethod(this, _Node_instances, getHandlerSets_fn).call(this, child, method, __privateGet(node, _params), params));
              if (Object.keys(__privateGet(child, _children2)).length) {
                __privateSet(child, _params, params);
                const componentCount = ((_a2 = m[0].match(/\//)) == null ? void 0 : _a2.length) ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] || (curNodesQueue[componentCount] = []);
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...__privateMethod(this, _Node_instances, getHandlerSets_fn).call(this, child, method, params, __privateGet(node, _params)));
              if (__privateGet(child, _children2)["*"]) {
                handlerSets.push(
                  ...__privateMethod(this, _Node_instances, getHandlerSets_fn).call(this, __privateGet(child, _children2)["*"], method, params, __privateGet(node, _params))
                );
              }
            } else {
              __privateSet(child, _params, params);
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, _methods = new WeakMap(), _children2 = new WeakMap(), _patterns = new WeakMap(), _order = new WeakMap(), _params = new WeakMap(), _Node_instances = new WeakSet(), getHandlerSets_fn = function(node, method, nodeParams, params) {
  const handlerSets = [];
  for (let i = 0, len = __privateGet(node, _methods).length; i < len; i++) {
    const m = __privateGet(node, _methods)[i];
    const handlerSet = m[method] || m[METHOD_NAME_ALL];
    const processedSet = {};
    if (handlerSet !== void 0) {
      handlerSet.params = /* @__PURE__ */ Object.create(null);
      handlerSets.push(handlerSet);
      if (nodeParams !== emptyParams || params && params !== emptyParams) {
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          const processed = processedSet[handlerSet.score];
          handlerSet.params[key] = (params == null ? void 0 : params[key]) && !processed ? params[key] : nodeParams[key] ?? (params == null ? void 0 : params[key]);
          processedSet[handlerSet.score] = true;
        }
      }
    }
  }
  return handlerSets;
}, _h);
var TrieRouter = (_i = class {
  constructor() {
    __publicField(this, "name", "TrieRouter");
    __privateAdd(this, _node);
    __privateSet(this, _node, new Node());
  }
  add(method, path2, handler) {
    const results = checkOptionalParameter(path2);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        __privateGet(this, _node).insert(method, results[i], handler);
      }
      return;
    }
    __privateGet(this, _node).insert(method, path2, handler);
  }
  match(method, path2) {
    return __privateGet(this, _node).search(method, path2);
  }
}, _node = new WeakMap(), _i);
var Hono = class extends Hono$1 {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};
var RequestError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "RequestError";
  }
};
var toRequestError = (e) => {
  if (e instanceof RequestError) {
    return e;
  }
  return new RequestError(e.message, { cause: e });
};
var GlobalRequest = global.Request;
var Request$1 = class Request2 extends GlobalRequest {
  constructor(input, options) {
    var _a2;
    if (typeof input === "object" && getRequestCache in input) {
      input = input[getRequestCache]();
    }
    if (typeof ((_a2 = options == null ? void 0 : options.body) == null ? void 0 : _a2.getReader) !== "undefined") {
      options.duplex ?? (options.duplex = "half");
    }
    super(input, options);
  }
};
var newRequestFromIncoming = (method, url, incoming, abortController) => {
  const headerRecord = [];
  const rawHeaders = incoming.rawHeaders;
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const { [i]: key, [i + 1]: value } = rawHeaders;
    if (key.charCodeAt(0) !== /*:*/
    58) {
      headerRecord.push([key, value]);
    }
  }
  const init = {
    method,
    headers: headerRecord,
    signal: abortController.signal
  };
  if (method === "TRACE") {
    init.method = "GET";
    const req = new Request$1(url, init);
    Object.defineProperty(req, "method", {
      get() {
        return "TRACE";
      }
    });
    return req;
  }
  if (!(method === "GET" || method === "HEAD")) {
    if ("rawBody" in incoming && incoming.rawBody instanceof Buffer) {
      init.body = new ReadableStream({
        start(controller) {
          controller.enqueue(incoming.rawBody);
          controller.close();
        }
      });
    } else {
      init.body = Readable.toWeb(incoming);
    }
  }
  return new Request$1(url, init);
};
var getRequestCache = Symbol("getRequestCache");
var requestCache = Symbol("requestCache");
var incomingKey = Symbol("incomingKey");
var urlKey = Symbol("urlKey");
var abortControllerKey = Symbol("abortControllerKey");
var getAbortController = Symbol("getAbortController");
var requestPrototype = {
  get method() {
    return this[incomingKey].method || "GET";
  },
  get url() {
    return this[urlKey];
  },
  [getAbortController]() {
    this[getRequestCache]();
    return this[abortControllerKey];
  },
  [getRequestCache]() {
    this[abortControllerKey] || (this[abortControllerKey] = new AbortController());
    return this[requestCache] || (this[requestCache] = newRequestFromIncoming(
      this.method,
      this[urlKey],
      this[incomingKey],
      this[abortControllerKey]
    ));
  }
};
[
  "body",
  "bodyUsed",
  "cache",
  "credentials",
  "destination",
  "headers",
  "integrity",
  "mode",
  "redirect",
  "referrer",
  "referrerPolicy",
  "signal",
  "keepalive"
].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    get() {
      return this[getRequestCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    value: function() {
      return this[getRequestCache]()[k]();
    }
  });
});
Object.setPrototypeOf(requestPrototype, Request$1.prototype);
var newRequest = (incoming, defaultHostname) => {
  const req = Object.create(requestPrototype);
  req[incomingKey] = incoming;
  const incomingUrl = incoming.url || "";
  if (incomingUrl[0] !== "/" && // short-circuit for performance. most requests are relative URL.
  (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://"))) {
    if (incoming instanceof Http2ServerRequest) {
      throw new RequestError("Absolute URL for :path is not allowed in HTTP/2");
    }
    try {
      const url2 = new URL(incomingUrl);
      req[urlKey] = url2.href;
    } catch (e) {
      throw new RequestError("Invalid absolute URL", { cause: e });
    }
    return req;
  }
  const host = (incoming instanceof Http2ServerRequest ? incoming.authority : incoming.headers.host) || defaultHostname;
  if (!host) {
    throw new RequestError("Missing host header");
  }
  let scheme;
  if (incoming instanceof Http2ServerRequest) {
    scheme = incoming.scheme;
    if (!(scheme === "http" || scheme === "https")) {
      throw new RequestError("Unsupported scheme");
    }
  } else {
    scheme = incoming.socket && incoming.socket.encrypted ? "https" : "http";
  }
  const url = new URL(`${scheme}://${host}${incomingUrl}`);
  if (url.hostname.length !== host.length && url.hostname !== host.replace(/:\d+$/, "")) {
    throw new RequestError("Invalid host header");
  }
  req[urlKey] = url.href;
  return req;
};
var responseCache = Symbol("responseCache");
var getResponseCache = Symbol("getResponseCache");
var cacheKey = Symbol("cache");
var GlobalResponse = global.Response;
var Response2 = (_j = class {
  constructor(body, init) {
    __privateAdd(this, _body);
    __privateAdd(this, _init);
    let headers;
    __privateSet(this, _body, body);
    if (init instanceof _j) {
      const cachedGlobalResponse = init[responseCache];
      if (cachedGlobalResponse) {
        __privateSet(this, _init, cachedGlobalResponse);
        this[getResponseCache]();
        return;
      } else {
        __privateSet(this, _init, __privateGet(init, _init));
        headers = new Headers(__privateGet(init, _init).headers);
      }
    } else {
      __privateSet(this, _init, init);
    }
    if (typeof body === "string" || typeof (body == null ? void 0 : body.getReader) !== "undefined" || body instanceof Blob || body instanceof Uint8Array) {
      headers || (headers = (init == null ? void 0 : init.headers) || { "content-type": "text/plain; charset=UTF-8" });
      this[cacheKey] = [(init == null ? void 0 : init.status) || 200, body, headers];
    }
  }
  [getResponseCache]() {
    delete this[cacheKey];
    return this[responseCache] || (this[responseCache] = new GlobalResponse(__privateGet(this, _body), __privateGet(this, _init)));
  }
  get headers() {
    const cache = this[cacheKey];
    if (cache) {
      if (!(cache[2] instanceof Headers)) {
        cache[2] = new Headers(cache[2]);
      }
      return cache[2];
    }
    return this[getResponseCache]().headers;
  }
  get status() {
    var _a2;
    return ((_a2 = this[cacheKey]) == null ? void 0 : _a2[0]) ?? this[getResponseCache]().status;
  }
  get ok() {
    const status = this.status;
    return status >= 200 && status < 300;
  }
}, _body = new WeakMap(), _init = new WeakMap(), _j);
["body", "bodyUsed", "redirected", "statusText", "trailers", "type", "url"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    get() {
      return this[getResponseCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(Response2.prototype, k, {
    value: function() {
      return this[getResponseCache]()[k]();
    }
  });
});
Object.setPrototypeOf(Response2, GlobalResponse);
Object.setPrototypeOf(Response2.prototype, GlobalResponse.prototype);
function writeFromReadableStream(stream, writable) {
  if (stream.locked) {
    throw new TypeError("ReadableStream is locked.");
  } else if (writable.destroyed) {
    stream.cancel();
    return;
  }
  const reader = stream.getReader();
  writable.on("close", cancel);
  writable.on("error", cancel);
  reader.read().then(flow, cancel);
  return reader.closed.finally(() => {
    writable.off("close", cancel);
    writable.off("error", cancel);
  });
  function cancel(error) {
    reader.cancel(error).catch(() => {
    });
    if (error) {
      writable.destroy(error);
    }
  }
  function onDrain() {
    reader.read().then(flow, cancel);
  }
  function flow({ done, value }) {
    try {
      if (done) {
        writable.end();
      } else if (!writable.write(value)) {
        writable.once("drain", onDrain);
      } else {
        return reader.read().then(flow, cancel);
      }
    } catch (e) {
      cancel(e);
    }
  }
}
var buildOutgoingHttpHeaders = (headers) => {
  const res = {};
  if (!(headers instanceof Headers)) {
    headers = new Headers(headers ?? void 0);
  }
  const cookies = [];
  for (const [k, v] of headers) {
    if (k === "set-cookie") {
      cookies.push(v);
    } else {
      res[k] = v;
    }
  }
  if (cookies.length > 0) {
    res["set-cookie"] = cookies;
  }
  res["content-type"] ?? (res["content-type"] = "text/plain; charset=UTF-8");
  return res;
};
var X_ALREADY_SENT = "x-hono-already-sent";
var webFetch = global.fetch;
if (typeof global.crypto === "undefined") {
  global.crypto = crypto;
}
global.fetch = (info, init) => {
  init = {
    // Disable compression handling so people can return the result of a fetch
    // directly in the loader without messing with the Content-Encoding header.
    compress: false,
    ...init
  };
  return webFetch(info, init);
};
var regBuffer = /^no$/i;
var regContentType = /^(application\/json\b|text\/(?!event-stream\b))/i;
var handleRequestError = () => new Response(null, {
  status: 400
});
var handleFetchError = (e) => new Response(null, {
  status: e instanceof Error && (e.name === "TimeoutError" || e.constructor.name === "TimeoutError") ? 504 : 500
});
var handleResponseError = (e, outgoing) => {
  const err = e instanceof Error ? e : new Error("unknown error", { cause: e });
  if (err.code === "ERR_STREAM_PREMATURE_CLOSE") {
    console.info("The user aborted a request.");
  } else {
    console.error(e);
    if (!outgoing.headersSent) {
      outgoing.writeHead(500, { "Content-Type": "text/plain" });
    }
    outgoing.end(`Error: ${err.message}`);
    outgoing.destroy(err);
  }
};
var responseViaCache = async (res, outgoing) => {
  var _a2;
  let [status, body, header] = res[cacheKey];
  if (header instanceof Headers) {
    header = buildOutgoingHttpHeaders(header);
  }
  if (typeof body === "string") {
    header["Content-Length"] = Buffer.byteLength(body);
  } else if (body instanceof Uint8Array) {
    header["Content-Length"] = body.byteLength;
  } else if (body instanceof Blob) {
    header["Content-Length"] = body.size;
  }
  outgoing.writeHead(status, header);
  if (typeof body === "string" || body instanceof Uint8Array) {
    outgoing.end(body);
  } else if (body instanceof Blob) {
    outgoing.end(new Uint8Array(await body.arrayBuffer()));
  } else {
    return (_a2 = writeFromReadableStream(body, outgoing)) == null ? void 0 : _a2.catch(
      (e) => handleResponseError(e, outgoing)
    );
  }
};
var responseViaResponseObject = async (res, outgoing, options = {}) => {
  if (res instanceof Promise) {
    if (options.errorHandler) {
      try {
        res = await res;
      } catch (err) {
        const errRes = await options.errorHandler(err);
        if (!errRes) {
          return;
        }
        res = errRes;
      }
    } else {
      res = await res.catch(handleFetchError);
    }
  }
  if (cacheKey in res) {
    return responseViaCache(res, outgoing);
  }
  const resHeaderRecord = buildOutgoingHttpHeaders(res.headers);
  if (res.body) {
    const {
      "transfer-encoding": transferEncoding,
      "content-encoding": contentEncoding,
      "content-length": contentLength,
      "x-accel-buffering": accelBuffering,
      "content-type": contentType
    } = resHeaderRecord;
    if (transferEncoding || contentEncoding || contentLength || // nginx buffering variant
    accelBuffering && regBuffer.test(accelBuffering) || !regContentType.test(contentType)) {
      outgoing.writeHead(res.status, resHeaderRecord);
      await writeFromReadableStream(res.body, outgoing);
    } else {
      const buffer = await res.arrayBuffer();
      resHeaderRecord["content-length"] = buffer.byteLength;
      outgoing.writeHead(res.status, resHeaderRecord);
      outgoing.end(new Uint8Array(buffer));
    }
  } else if (resHeaderRecord[X_ALREADY_SENT]) ;
  else {
    outgoing.writeHead(res.status, resHeaderRecord);
    outgoing.end();
  }
};
var getRequestListener = (fetchCallback, options = {}) => {
  if (options.overrideGlobalObjects !== false && global.Request !== Request$1) {
    Object.defineProperty(global, "Request", {
      value: Request$1
    });
    Object.defineProperty(global, "Response", {
      value: Response2
    });
  }
  return async (incoming, outgoing) => {
    let res, req;
    try {
      req = newRequest(incoming, options.hostname);
      outgoing.on("close", () => {
        const abortController = req[abortControllerKey];
        if (!abortController) {
          return;
        }
        if (incoming.errored) {
          req[abortControllerKey].abort(incoming.errored.toString());
        } else if (!outgoing.writableFinished) {
          req[abortControllerKey].abort("Client connection prematurely closed.");
        }
      });
      res = fetchCallback(req, { incoming, outgoing });
      if (cacheKey in res) {
        return responseViaCache(res, outgoing);
      }
    } catch (e) {
      if (!res) {
        if (options.errorHandler) {
          res = await options.errorHandler(req ? e : toRequestError(e));
          if (!res) {
            return;
          }
        } else if (!req) {
          res = handleRequestError();
        } else {
          res = handleFetchError(e);
        }
      } else {
        return handleResponseError(e, outgoing);
      }
    }
    try {
      return await responseViaResponseObject(res, outgoing, options);
    } catch (e) {
      return handleResponseError(e, outgoing);
    }
  };
};
var createAdaptorServer = (options) => {
  const fetchCallback = options.fetch;
  const requestListener = getRequestListener(fetchCallback, {
    hostname: options.hostname,
    overrideGlobalObjects: options.overrideGlobalObjects
  });
  const createServer$1 = options.createServer || createServer;
  const server = createServer$1(options.serverOptions || {}, requestListener);
  return server;
};
var serve = (options, listeningListener) => {
  const server = createAdaptorServer(options);
  server.listen((options == null ? void 0 : options.port) ?? 3e3, options.hostname, () => {
    const serverInfo = server.address();
    listeningListener && listeningListener(serverInfo);
  });
  return server;
};
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  return async function cors2(c, next) {
    var _a2, _b2;
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.origin !== "*") {
      const existingVary = c.req.header("Vary");
      if (existingVary) {
        set("Vary", existingVary);
      } else {
        set("Vary", "Origin");
      }
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if ((_a2 = opts.exposeHeaders) == null ? void 0 : _a2.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      if ((_b2 = opts.allowMethods) == null ? void 0 : _b2.length) {
        set("Access-Control-Allow-Methods", opts.allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!(headers == null ? void 0 : headers.length)) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers == null ? void 0 : headers.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
  };
};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var r = /[A-Z]/g;
var dnsEqual$3 = function(a, b) {
  a = a.replace(r, replacer);
  b = b.replace(r, replacer);
  return a === b;
};
function replacer(m) {
  return m.toLowerCase();
}
var arrayFlatten = { exports: {} };
arrayFlatten.exports = flatten$2;
arrayFlatten.exports.from = flattenFrom;
arrayFlatten.exports.depth = flattenDepth;
arrayFlatten.exports.fromDepth = flattenFromDepth;
function flatten$2(array) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected value to be an array");
  }
  return flattenFrom(array);
}
function flattenFrom(array) {
  return flattenDown(array, []);
}
function flattenDepth(array, depth) {
  if (!Array.isArray(array)) {
    throw new TypeError("Expected value to be an array");
  }
  return flattenFromDepth(array, depth);
}
function flattenFromDepth(array, depth) {
  if (typeof depth !== "number") {
    throw new TypeError("Expected the depth to be a number");
  }
  return flattenDownDepth(array, [], depth);
}
function flattenDown(array, result) {
  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    if (Array.isArray(value)) {
      flattenDown(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}
function flattenDownDepth(array, result, depth) {
  depth--;
  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    if (depth > -1 && Array.isArray(value)) {
      flattenDownDepth(value, result, depth);
    } else {
      result.push(value);
    }
  }
  return result;
}
var arrayFlattenExports = arrayFlatten.exports;
var multicastDnsServiceTypes = {};
(function(exports) {
  var prefix = function(name) {
    return "_" + name;
  };
  var defined = function(name) {
    return name;
  };
  exports.stringify = function(data) {
    if (typeof data === "object" && data && data.name) return exports.stringify(data.name, data.protocol, data.subtypes);
    return Array.prototype.concat.apply([], arguments).filter(defined).map(prefix).join(".");
  };
  exports.parse = function(str) {
    var parts = str.split(".");
    for (var i = 0; i < parts.length; i++) {
      if (parts[i][0] !== "_") continue;
      parts[i] = parts[i].slice(1);
    }
    return {
      name: parts.shift(),
      protocol: parts.shift() || null,
      subtypes: parts
    };
  };
  exports.tcp = function(name) {
    return exports.stringify(name, "tcp", Array.prototype.concat.apply([], Array.prototype.slice.call(arguments, 1)));
  };
  exports.udp = function(name) {
    return exports.stringify(name, "udp", Array.prototype.concat.apply([], Array.prototype.slice.call(arguments, 1)));
  };
})(multicastDnsServiceTypes);
var bufferIndexof = function bufferIndexOf(buff, search, offset, encoding) {
  if (!Buffer.isBuffer(buff)) {
    throw TypeError("buffer is not a buffer");
  }
  if (encoding === void 0 && typeof offset === "string") {
    encoding = offset;
    offset = void 0;
  }
  if (typeof search === "string") {
    search = new Buffer(search, encoding || "utf8");
  } else if (typeof search === "number" && !isNaN(search)) {
    search = new Buffer([search]);
  } else if (!Buffer.isBuffer(search)) {
    throw TypeError("search is not a bufferable object");
  }
  if (search.length === 0) {
    return -1;
  }
  if (offset === void 0 || typeof offset === "number" && isNaN(offset)) {
    offset = 0;
  } else if (typeof offset !== "number") {
    throw TypeError("offset is not a number");
  }
  if (offset < 0) {
    offset = buff.length + offset;
  }
  if (offset < 0) {
    offset = 0;
  }
  var m = 0;
  var s = -1;
  for (var i = offset; i < buff.length; ++i) {
    if (buff[i] != search[m]) {
      s = -1;
      i -= m - 1;
      m = 0;
    }
    if (buff[i] == search[m]) {
      if (s == -1) {
        s = i;
      }
      ++m;
      if (m == search.length) {
        break;
      }
    }
  }
  if (s > -1 && buff.length - s < search.length) {
    return -1;
  }
  return s;
};
var bindexOf = bufferIndexof;
var equalSign = new Buffer("=");
var dnsTxt$1 = function(opts) {
  var binary = opts ? opts.binary : false;
  var that = {};
  that.encode = function(data, buf, offset) {
    if (!data) data = {};
    if (!offset) offset = 0;
    if (!buf) buf = new Buffer(that.encodingLength(data) + offset);
    var oldOffset = offset;
    var keys3 = Object.keys(data);
    if (keys3.length === 0) {
      buf[offset] = 0;
      offset++;
    }
    keys3.forEach(function(key) {
      var val = data[key];
      var oldOffset2 = offset;
      offset++;
      if (val === true) {
        offset += buf.write(key, offset);
      } else if (Buffer.isBuffer(val)) {
        offset += buf.write(key + "=", offset);
        var len = val.length;
        val.copy(buf, offset, 0, len);
        offset += len;
      } else {
        offset += buf.write(key + "=" + val, offset);
      }
      buf[oldOffset2] = offset - oldOffset2 - 1;
    });
    that.encode.bytes = offset - oldOffset;
    return buf;
  };
  that.decode = function(buf, offset, len) {
    if (!offset) offset = 0;
    if (!Number.isFinite(len)) len = buf.length;
    var data = {};
    var oldOffset = offset;
    while (offset < len) {
      var b = decodeBlock(buf, offset);
      var i = bindexOf(b, equalSign);
      offset += decodeBlock.bytes;
      if (b.length === 0) continue;
      if (i === -1) data[b.toString().toLowerCase()] = true;
      else if (i === 0) continue;
      else {
        var key = b.slice(0, i).toString().toLowerCase();
        if (key in data) continue;
        data[key] = binary ? b.slice(i + 1) : b.slice(i + 1).toString();
      }
    }
    that.decode.bytes = offset - oldOffset;
    return data;
  };
  that.encodingLength = function(data) {
    if (!data) return 1;
    var keys3 = Object.keys(data);
    if (keys3.length === 0) return 1;
    return keys3.reduce(function(total, key) {
      var val = data[key];
      total += Buffer.byteLength(key) + 1;
      if (Buffer.isBuffer(val)) total += val.length + 1;
      else if (val !== true) total += Buffer.byteLength(String(val)) + 1;
      return total;
    }, 0);
  };
  return that;
};
function decodeBlock(buf, offset) {
  var len = buf[offset];
  var to = offset + 1 + len;
  var b = buf.slice(offset + 1, to > buf.length ? buf.length : to);
  decodeBlock.bytes = len + 1;
  return b;
}
var os$1 = require$$0;
var util$1 = require$$1;
var EventEmitter$1 = require$$2.EventEmitter;
var serviceName$1 = multicastDnsServiceTypes;
var txt = dnsTxt$1();
var TLD$1 = ".local";
var service = Service$1;
util$1.inherits(Service$1, EventEmitter$1);
function Service$1(opts) {
  if (!opts.name) throw new Error("Required name not given");
  if (!opts.type) throw new Error("Required type not given");
  if (!opts.port) throw new Error("Required port not given");
  this.name = opts.name;
  this.protocol = opts.protocol || "tcp";
  this.type = serviceName$1.stringify(opts.type, this.protocol);
  this.host = opts.host || os$1.hostname();
  this.port = opts.port;
  this.fqdn = this.name + "." + this.type + TLD$1;
  this.subtypes = opts.subtypes || null;
  this.txt = opts.txt || null;
  this.published = false;
  this._activated = false;
}
Service$1.prototype._records = function() {
  var records = [rr_ptr(this), rr_srv(this), rr_txt(this)];
  var self = this;
  var interfaces = os$1.networkInterfaces();
  Object.keys(interfaces).forEach(function(name) {
    interfaces[name].forEach(function(addr) {
      if (addr.internal) return;
      if (addr.family === "IPv4") {
        records.push(rr_a(self, addr.address));
      } else {
        records.push(rr_aaaa(self, addr.address));
      }
    });
  });
  return records;
};
function rr_ptr(service2) {
  return {
    name: service2.type + TLD$1,
    type: "PTR",
    ttl: 28800,
    data: service2.fqdn
  };
}
function rr_srv(service2) {
  return {
    name: service2.fqdn,
    type: "SRV",
    ttl: 120,
    data: {
      port: service2.port,
      target: service2.host
    }
  };
}
function rr_txt(service2) {
  return {
    name: service2.fqdn,
    type: "TXT",
    ttl: 4500,
    data: txt.encode(service2.txt)
  };
}
function rr_a(service2, ip2) {
  return {
    name: service2.host,
    type: "A",
    ttl: 120,
    data: ip2
  };
}
function rr_aaaa(service2, ip2) {
  return {
    name: service2.host,
    type: "AAAA",
    ttl: 120,
    data: ip2
  };
}
var dnsEqual$2 = dnsEqual$3;
var flatten$1 = arrayFlattenExports;
var Service = service;
var REANNOUNCE_MAX_MS = 60 * 60 * 1e3;
var REANNOUNCE_FACTOR = 3;
var registry = Registry$1;
function Registry$1(server) {
  this._server = server;
  this._services = [];
}
Registry$1.prototype.publish = function(opts) {
  var service2 = new Service(opts);
  service2.start = start.bind(service2, this);
  service2.stop = stop.bind(service2, this);
  service2.start({ probe: opts.probe !== false });
  return service2;
};
Registry$1.prototype.unpublishAll = function(cb) {
  teardown(this._server, this._services, cb);
  this._services = [];
};
Registry$1.prototype.destroy = function() {
  this._services.forEach(function(service2) {
    service2._destroyed = true;
  });
};
function start(registry2, opts) {
  if (this._activated) return;
  this._activated = true;
  registry2._services.push(this);
  if (opts.probe) {
    var service2 = this;
    probe(registry2._server.mdns, this, function(exists) {
      if (exists) {
        service2.stop();
        service2.emit("error", new Error("Service name is already in use on the network"));
        return;
      }
      announce(registry2._server, service2);
    });
  } else {
    announce(registry2._server, this);
  }
}
function stop(registry2, cb) {
  if (!this._activated) return;
  teardown(registry2._server, this, cb);
  var index = registry2._services.indexOf(this);
  if (index !== -1) registry2._services.splice(index, 1);
}
function probe(mdns, service2, cb) {
  var sent = false;
  var retries = 0;
  var timer;
  mdns.on("response", onresponse);
  setTimeout(send, Math.random() * 250);
  function send() {
    if (!service2._activated || service2._destroyed) return;
    mdns.query(service2.fqdn, "ANY", function() {
      sent = true;
      timer = setTimeout(++retries < 3 ? send : done, 250);
      timer.unref();
    });
  }
  function onresponse(packet2) {
    if (!sent) return;
    if (packet2.answers.some(matchRR) || packet2.additionals.some(matchRR)) done(true);
  }
  function matchRR(rr) {
    return dnsEqual$2(rr.name, service2.fqdn);
  }
  function done(exists) {
    mdns.removeListener("response", onresponse);
    clearTimeout(timer);
    cb(!!exists);
  }
}
function announce(server, service2) {
  var delay = 1e3;
  var packet2 = service2._records();
  server.register(packet2);
  (function broadcast() {
    if (!service2._activated || service2._destroyed) return;
    server.mdns.respond(packet2, function() {
      if (!service2.published) {
        service2._activated = true;
        service2.published = true;
        service2.emit("up");
      }
      delay = delay * REANNOUNCE_FACTOR;
      if (delay < REANNOUNCE_MAX_MS && !service2._destroyed) {
        setTimeout(broadcast, delay).unref();
      }
    });
  })();
}
function teardown(server, services, cb) {
  if (!Array.isArray(services)) services = [services];
  services = services.filter(function(service2) {
    return service2._activated;
  });
  var records = flatten$1.depth(services.map(function(service2) {
    service2._activated = false;
    var records2 = service2._records();
    records2.forEach(function(record) {
      record.ttl = 0;
    });
    return records2;
  }), 1);
  if (records.length === 0) return cb && cb();
  server.unregister(records);
  server.mdns.respond(records, function() {
    services.forEach(function(service2) {
      service2.published = false;
    });
    if (cb) cb.apply(null, arguments);
  });
}
var dnsPacket = {};
var types = {};
types.toString = function(type2) {
  switch (type2) {
    case 1:
      return "A";
    case 10:
      return "NULL";
    case 28:
      return "AAAA";
    case 18:
      return "AFSDB";
    case 42:
      return "APL";
    case 257:
      return "CAA";
    case 60:
      return "CDNSKEY";
    case 59:
      return "CDS";
    case 37:
      return "CERT";
    case 5:
      return "CNAME";
    case 49:
      return "DHCID";
    case 32769:
      return "DLV";
    case 39:
      return "DNAME";
    case 48:
      return "DNSKEY";
    case 43:
      return "DS";
    case 55:
      return "HIP";
    case 13:
      return "HINFO";
    case 45:
      return "IPSECKEY";
    case 25:
      return "KEY";
    case 36:
      return "KX";
    case 29:
      return "LOC";
    case 15:
      return "MX";
    case 35:
      return "NAPTR";
    case 2:
      return "NS";
    case 47:
      return "NSEC";
    case 50:
      return "NSEC3";
    case 51:
      return "NSEC3PARAM";
    case 12:
      return "PTR";
    case 46:
      return "RRSIG";
    case 17:
      return "RP";
    case 24:
      return "SIG";
    case 6:
      return "SOA";
    case 99:
      return "SPF";
    case 33:
      return "SRV";
    case 44:
      return "SSHFP";
    case 32768:
      return "TA";
    case 249:
      return "TKEY";
    case 52:
      return "TLSA";
    case 250:
      return "TSIG";
    case 16:
      return "TXT";
    case 252:
      return "AXFR";
    case 251:
      return "IXFR";
    case 41:
      return "OPT";
    case 255:
      return "ANY";
  }
  return "UNKNOWN_" + type2;
};
types.toType = function(name) {
  switch (name.toUpperCase()) {
    case "A":
      return 1;
    case "NULL":
      return 10;
    case "AAAA":
      return 28;
    case "AFSDB":
      return 18;
    case "APL":
      return 42;
    case "CAA":
      return 257;
    case "CDNSKEY":
      return 60;
    case "CDS":
      return 59;
    case "CERT":
      return 37;
    case "CNAME":
      return 5;
    case "DHCID":
      return 49;
    case "DLV":
      return 32769;
    case "DNAME":
      return 39;
    case "DNSKEY":
      return 48;
    case "DS":
      return 43;
    case "HIP":
      return 55;
    case "HINFO":
      return 13;
    case "IPSECKEY":
      return 45;
    case "KEY":
      return 25;
    case "KX":
      return 36;
    case "LOC":
      return 29;
    case "MX":
      return 15;
    case "NAPTR":
      return 35;
    case "NS":
      return 2;
    case "NSEC":
      return 47;
    case "NSEC3":
      return 50;
    case "NSEC3PARAM":
      return 51;
    case "PTR":
      return 12;
    case "RRSIG":
      return 46;
    case "RP":
      return 17;
    case "SIG":
      return 24;
    case "SOA":
      return 6;
    case "SPF":
      return 99;
    case "SRV":
      return 33;
    case "SSHFP":
      return 44;
    case "TA":
      return 32768;
    case "TKEY":
      return 249;
    case "TLSA":
      return 52;
    case "TSIG":
      return 250;
    case "TXT":
      return 16;
    case "AXFR":
      return 252;
    case "IXFR":
      return 251;
    case "OPT":
      return 41;
    case "ANY":
      return 255;
    case "*":
      return 255;
  }
  return 0;
};
var rcodes = {};
rcodes.toString = function(rcode) {
  switch (rcode) {
    case 0:
      return "NOERROR";
    case 1:
      return "FORMERR";
    case 2:
      return "SERVFAIL";
    case 3:
      return "NXDOMAIN";
    case 4:
      return "NOTIMP";
    case 5:
      return "REFUSED";
    case 6:
      return "YXDOMAIN";
    case 7:
      return "YXRRSET";
    case 8:
      return "NXRRSET";
    case 9:
      return "NOTAUTH";
    case 10:
      return "NOTZONE";
    case 11:
      return "RCODE_11";
    case 12:
      return "RCODE_12";
    case 13:
      return "RCODE_13";
    case 14:
      return "RCODE_14";
    case 15:
      return "RCODE_15";
  }
  return "RCODE_" + rcode;
};
rcodes.toRcode = function(code) {
  switch (code.toUpperCase()) {
    case "NOERROR":
      return 0;
    case "FORMERR":
      return 1;
    case "SERVFAIL":
      return 2;
    case "NXDOMAIN":
      return 3;
    case "NOTIMP":
      return 4;
    case "REFUSED":
      return 5;
    case "YXDOMAIN":
      return 6;
    case "YXRRSET":
      return 7;
    case "NXRRSET":
      return 8;
    case "NOTAUTH":
      return 9;
    case "NOTZONE":
      return 10;
    case "RCODE_11":
      return 11;
    case "RCODE_12":
      return 12;
    case "RCODE_13":
      return 13;
    case "RCODE_14":
      return 14;
    case "RCODE_15":
      return 15;
  }
  return 0;
};
var opcodes = {};
opcodes.toString = function(opcode) {
  switch (opcode) {
    case 0:
      return "QUERY";
    case 1:
      return "IQUERY";
    case 2:
      return "STATUS";
    case 3:
      return "OPCODE_3";
    case 4:
      return "NOTIFY";
    case 5:
      return "UPDATE";
    case 6:
      return "OPCODE_6";
    case 7:
      return "OPCODE_7";
    case 8:
      return "OPCODE_8";
    case 9:
      return "OPCODE_9";
    case 10:
      return "OPCODE_10";
    case 11:
      return "OPCODE_11";
    case 12:
      return "OPCODE_12";
    case 13:
      return "OPCODE_13";
    case 14:
      return "OPCODE_14";
    case 15:
      return "OPCODE_15";
  }
  return "OPCODE_" + opcode;
};
opcodes.toOpcode = function(code) {
  switch (code.toUpperCase()) {
    case "QUERY":
      return 0;
    case "IQUERY":
      return 1;
    case "STATUS":
      return 2;
    case "OPCODE_3":
      return 3;
    case "NOTIFY":
      return 4;
    case "UPDATE":
      return 5;
    case "OPCODE_6":
      return 6;
    case "OPCODE_7":
      return 7;
    case "OPCODE_8":
      return 8;
    case "OPCODE_9":
      return 9;
    case "OPCODE_10":
      return 10;
    case "OPCODE_11":
      return 11;
    case "OPCODE_12":
      return 12;
    case "OPCODE_13":
      return 13;
    case "OPCODE_14":
      return 14;
    case "OPCODE_15":
      return 15;
  }
  return 0;
};
var ip = {};
(function(exports) {
  var ip2 = exports;
  var { Buffer: Buffer2 } = require$$0$1;
  var os2 = require$$0;
  ip2.toBuffer = function(ip3, buff, offset) {
    offset = ~~offset;
    var result;
    if (this.isV4Format(ip3)) {
      result = buff || new Buffer2(offset + 4);
      ip3.split(/\./g).map((byte) => {
        result[offset++] = parseInt(byte, 10) & 255;
      });
    } else if (this.isV6Format(ip3)) {
      var sections = ip3.split(":", 8);
      var i;
      for (i = 0; i < sections.length; i++) {
        var isv4 = this.isV4Format(sections[i]);
        var v4Buffer;
        if (isv4) {
          v4Buffer = this.toBuffer(sections[i]);
          sections[i] = v4Buffer.slice(0, 2).toString("hex");
        }
        if (v4Buffer && ++i < 8) {
          sections.splice(i, 0, v4Buffer.slice(2, 4).toString("hex"));
        }
      }
      if (sections[0] === "") {
        while (sections.length < 8) sections.unshift("0");
      } else if (sections[sections.length - 1] === "") {
        while (sections.length < 8) sections.push("0");
      } else if (sections.length < 8) {
        for (i = 0; i < sections.length && sections[i] !== ""; i++) ;
        var argv = [i, 1];
        for (i = 9 - sections.length; i > 0; i--) {
          argv.push("0");
        }
        sections.splice.apply(sections, argv);
      }
      result = buff || new Buffer2(offset + 16);
      for (i = 0; i < sections.length; i++) {
        var word = parseInt(sections[i], 16);
        result[offset++] = word >> 8 & 255;
        result[offset++] = word & 255;
      }
    }
    if (!result) {
      throw Error(`Invalid ip address: ${ip3}`);
    }
    return result;
  };
  ip2.toString = function(buff, offset, length) {
    offset = ~~offset;
    length = length || buff.length - offset;
    var result = [];
    var i;
    if (length === 4) {
      for (i = 0; i < length; i++) {
        result.push(buff[offset + i]);
      }
      result = result.join(".");
    } else if (length === 16) {
      for (i = 0; i < length; i += 2) {
        result.push(buff.readUInt16BE(offset + i).toString(16));
      }
      result = result.join(":");
      result = result.replace(/(^|:)0(:0)*:0(:|$)/, "$1::$3");
      result = result.replace(/:{3,4}/, "::");
    }
    return result;
  };
  var ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/;
  var ipv6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;
  ip2.isV4Format = function(ip3) {
    return ipv4Regex.test(ip3);
  };
  ip2.isV6Format = function(ip3) {
    return ipv6Regex.test(ip3);
  };
  function _normalizeFamily(family) {
    if (family === 4) {
      return "ipv4";
    }
    if (family === 6) {
      return "ipv6";
    }
    return family ? family.toLowerCase() : "ipv4";
  }
  ip2.fromPrefixLen = function(prefixlen, family) {
    if (prefixlen > 32) {
      family = "ipv6";
    } else {
      family = _normalizeFamily(family);
    }
    var len = 4;
    if (family === "ipv6") {
      len = 16;
    }
    var buff = new Buffer2(len);
    for (var i = 0, n = buff.length; i < n; ++i) {
      var bits = 8;
      if (prefixlen < 8) {
        bits = prefixlen;
      }
      prefixlen -= bits;
      buff[i] = ~(255 >> bits) & 255;
    }
    return ip2.toString(buff);
  };
  ip2.mask = function(addr, mask) {
    addr = ip2.toBuffer(addr);
    mask = ip2.toBuffer(mask);
    var result = new Buffer2(Math.max(addr.length, mask.length));
    var i;
    if (addr.length === mask.length) {
      for (i = 0; i < addr.length; i++) {
        result[i] = addr[i] & mask[i];
      }
    } else if (mask.length === 4) {
      for (i = 0; i < mask.length; i++) {
        result[i] = addr[addr.length - 4 + i] & mask[i];
      }
    } else {
      for (i = 0; i < result.length - 6; i++) {
        result[i] = 0;
      }
      result[10] = 255;
      result[11] = 255;
      for (i = 0; i < addr.length; i++) {
        result[i + 12] = addr[i] & mask[i + 12];
      }
      i += 12;
    }
    for (; i < result.length; i++) {
      result[i] = 0;
    }
    return ip2.toString(result);
  };
  ip2.cidr = function(cidrString) {
    var cidrParts = cidrString.split("/");
    var addr = cidrParts[0];
    if (cidrParts.length !== 2) {
      throw new Error(`invalid CIDR subnet: ${addr}`);
    }
    var mask = ip2.fromPrefixLen(parseInt(cidrParts[1], 10));
    return ip2.mask(addr, mask);
  };
  ip2.subnet = function(addr, mask) {
    var networkAddress = ip2.toLong(ip2.mask(addr, mask));
    var maskBuffer = ip2.toBuffer(mask);
    var maskLength = 0;
    for (var i = 0; i < maskBuffer.length; i++) {
      if (maskBuffer[i] === 255) {
        maskLength += 8;
      } else {
        var octet = maskBuffer[i] & 255;
        while (octet) {
          octet = octet << 1 & 255;
          maskLength++;
        }
      }
    }
    var numberOfAddresses = Math.pow(2, 32 - maskLength);
    return {
      networkAddress: ip2.fromLong(networkAddress),
      firstAddress: numberOfAddresses <= 2 ? ip2.fromLong(networkAddress) : ip2.fromLong(networkAddress + 1),
      lastAddress: numberOfAddresses <= 2 ? ip2.fromLong(networkAddress + numberOfAddresses - 1) : ip2.fromLong(networkAddress + numberOfAddresses - 2),
      broadcastAddress: ip2.fromLong(networkAddress + numberOfAddresses - 1),
      subnetMask: mask,
      subnetMaskLength: maskLength,
      numHosts: numberOfAddresses <= 2 ? numberOfAddresses : numberOfAddresses - 2,
      length: numberOfAddresses,
      contains(other) {
        return networkAddress === ip2.toLong(ip2.mask(other, mask));
      }
    };
  };
  ip2.cidrSubnet = function(cidrString) {
    var cidrParts = cidrString.split("/");
    var addr = cidrParts[0];
    if (cidrParts.length !== 2) {
      throw new Error(`invalid CIDR subnet: ${addr}`);
    }
    var mask = ip2.fromPrefixLen(parseInt(cidrParts[1], 10));
    return ip2.subnet(addr, mask);
  };
  ip2.not = function(addr) {
    var buff = ip2.toBuffer(addr);
    for (var i = 0; i < buff.length; i++) {
      buff[i] = 255 ^ buff[i];
    }
    return ip2.toString(buff);
  };
  ip2.or = function(a, b) {
    var i;
    a = ip2.toBuffer(a);
    b = ip2.toBuffer(b);
    if (a.length === b.length) {
      for (i = 0; i < a.length; ++i) {
        a[i] |= b[i];
      }
      return ip2.toString(a);
    }
    var buff = a;
    var other = b;
    if (b.length > a.length) {
      buff = b;
      other = a;
    }
    var offset = buff.length - other.length;
    for (i = offset; i < buff.length; ++i) {
      buff[i] |= other[i - offset];
    }
    return ip2.toString(buff);
  };
  ip2.isEqual = function(a, b) {
    var i;
    a = ip2.toBuffer(a);
    b = ip2.toBuffer(b);
    if (a.length === b.length) {
      for (i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    if (b.length === 4) {
      var t = b;
      b = a;
      a = t;
    }
    for (i = 0; i < 10; i++) {
      if (b[i] !== 0) return false;
    }
    var word = b.readUInt16BE(10);
    if (word !== 0 && word !== 65535) return false;
    for (i = 0; i < 4; i++) {
      if (a[i] !== b[i + 12]) return false;
    }
    return true;
  };
  ip2.isPrivate = function(addr) {
    if (ip2.isLoopback(addr)) {
      return true;
    }
    if (!ip2.isV6Format(addr)) {
      const ipl = ip2.normalizeToLong(addr);
      if (ipl < 0) {
        throw new Error("invalid ipv4 address");
      }
      addr = ip2.fromLong(ipl);
    }
    return /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^f[cd][0-9a-f]{2}:/i.test(addr) || /^fe80:/i.test(addr) || /^::1$/.test(addr) || /^::$/.test(addr);
  };
  ip2.isPublic = function(addr) {
    return !ip2.isPrivate(addr);
  };
  ip2.isLoopback = function(addr) {
    if (!/\./.test(addr) && !/:/.test(addr)) {
      addr = ip2.fromLong(Number(addr));
    }
    return /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})/.test(addr) || /^0177\./.test(addr) || /^0x7f\./i.test(addr) || /^fe80::1$/i.test(addr) || /^::1$/.test(addr) || /^::$/.test(addr);
  };
  ip2.loopback = function(family) {
    family = _normalizeFamily(family);
    if (family !== "ipv4" && family !== "ipv6") {
      throw new Error("family must be ipv4 or ipv6");
    }
    return family === "ipv4" ? "127.0.0.1" : "fe80::1";
  };
  ip2.address = function(name, family) {
    var interfaces = os2.networkInterfaces();
    family = _normalizeFamily(family);
    if (name && name !== "private" && name !== "public") {
      var res = interfaces[name].filter((details) => {
        var itemFamily = _normalizeFamily(details.family);
        return itemFamily === family;
      });
      if (res.length === 0) {
        return void 0;
      }
      return res[0].address;
    }
    var all = Object.keys(interfaces).map((nic) => {
      var addresses = interfaces[nic].filter((details) => {
        details.family = _normalizeFamily(details.family);
        if (details.family !== family || ip2.isLoopback(details.address)) {
          return false;
        }
        if (!name) {
          return true;
        }
        return name === "public" ? ip2.isPrivate(details.address) : ip2.isPublic(details.address);
      });
      return addresses.length ? addresses[0].address : void 0;
    }).filter(Boolean);
    return !all.length ? ip2.loopback(family) : all[0];
  };
  ip2.toLong = function(ip3) {
    var ipl = 0;
    ip3.split(".").forEach((octet) => {
      ipl <<= 8;
      ipl += parseInt(octet);
    });
    return ipl >>> 0;
  };
  ip2.fromLong = function(ipl) {
    return `${ipl >>> 24}.${ipl >> 16 & 255}.${ipl >> 8 & 255}.${ipl & 255}`;
  };
  ip2.normalizeToLong = function(addr) {
    const parts = addr.split(".").map((part) => {
      if (part.startsWith("0x") || part.startsWith("0X")) {
        return parseInt(part, 16);
      } else if (part.startsWith("0") && part !== "0" && /^[0-7]+$/.test(part)) {
        return parseInt(part, 8);
      } else if (/^[1-9]\d*$/.test(part) || part === "0") {
        return parseInt(part, 10);
      } else {
        return NaN;
      }
    });
    if (parts.some(isNaN)) return -1;
    let val = 0;
    const n = parts.length;
    switch (n) {
      case 1:
        val = parts[0];
        break;
      case 2:
        if (parts[0] > 255 || parts[1] > 16777215) return -1;
        val = parts[0] << 24 | parts[1] & 16777215;
        break;
      case 3:
        if (parts[0] > 255 || parts[1] > 255 || parts[2] > 65535) return -1;
        val = parts[0] << 24 | parts[1] << 16 | parts[2] & 65535;
        break;
      case 4:
        if (parts.some((part) => part > 255)) return -1;
        val = parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3];
        break;
      default:
        return -1;
    }
    return val >>> 0;
  };
})(ip);
var safeBuffer = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
(function(module, exports) {
  var buffer = require$$0$1;
  var Buffer2 = buffer.Buffer;
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer2(arg, encodingOrOffset, length);
  }
  SafeBuffer.prototype = Object.create(Buffer2.prototype);
  copyProps(Buffer2, SafeBuffer);
  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer2(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer2(size);
    if (fill !== void 0) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer2(size);
  };
  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer.SlowBuffer(size);
  };
})(safeBuffer, safeBuffer.exports);
var safeBufferExports = safeBuffer.exports;
(function(exports) {
  var types$1 = types;
  var rcodes$1 = rcodes;
  var opcodes$1 = opcodes;
  var ip$1 = ip;
  var Buffer2 = safeBufferExports.Buffer;
  var QUERY_FLAG = 0;
  var RESPONSE_FLAG = 1 << 15;
  var FLUSH_MASK = 1 << 15;
  var NOT_FLUSH_MASK = -32769;
  var QU_MASK = 1 << 15;
  var NOT_QU_MASK = -32769;
  var name = exports.txt = exports.name = {};
  name.encode = function(str, buf, offset) {
    if (!buf) buf = Buffer2.alloc(name.encodingLength(str));
    if (!offset) offset = 0;
    var oldOffset = offset;
    var n = str.replace(/^\.|\.$/gm, "");
    if (n.length) {
      var list = n.split(".");
      for (var i = 0; i < list.length; i++) {
        var len = buf.write(list[i], offset + 1);
        buf[offset] = len;
        offset += len + 1;
      }
    }
    buf[offset++] = 0;
    name.encode.bytes = offset - oldOffset;
    return buf;
  };
  name.encode.bytes = 0;
  name.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var list = [];
    var oldOffset = offset;
    var len = buf[offset++];
    if (len === 0) {
      name.decode.bytes = 1;
      return ".";
    }
    if (len >= 192) {
      var res = name.decode(buf, buf.readUInt16BE(offset - 1) - 49152);
      name.decode.bytes = 2;
      return res;
    }
    while (len) {
      if (len >= 192) {
        list.push(name.decode(buf, buf.readUInt16BE(offset - 1) - 49152));
        offset++;
        break;
      }
      list.push(buf.toString("utf-8", offset, offset + len));
      offset += len;
      len = buf[offset++];
    }
    name.decode.bytes = offset - oldOffset;
    return list.join(".");
  };
  name.decode.bytes = 0;
  name.encodingLength = function(n) {
    if (n === "." || n === "..") return 1;
    return Buffer2.byteLength(n.replace(/^\.|\.$/gm, "")) + 2;
  };
  var string = {};
  string.encode = function(s, buf, offset) {
    if (!buf) buf = Buffer2.alloc(string.encodingLength(s));
    if (!offset) offset = 0;
    var len = buf.write(s, offset + 1);
    buf[offset] = len;
    string.encode.bytes = len + 1;
    return buf;
  };
  string.encode.bytes = 0;
  string.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var len = buf[offset];
    var s = buf.toString("utf-8", offset + 1, offset + 1 + len);
    string.decode.bytes = len + 1;
    return s;
  };
  string.decode.bytes = 0;
  string.encodingLength = function(s) {
    return Buffer2.byteLength(s) + 1;
  };
  var header = {};
  header.encode = function(h, buf, offset) {
    if (!buf) buf = header.encodingLength(h);
    if (!offset) offset = 0;
    var flags3 = (h.flags || 0) & 32767;
    var type2 = h.type === "response" ? RESPONSE_FLAG : QUERY_FLAG;
    buf.writeUInt16BE(h.id || 0, offset);
    buf.writeUInt16BE(flags3 | type2, offset + 2);
    buf.writeUInt16BE(h.questions.length, offset + 4);
    buf.writeUInt16BE(h.answers.length, offset + 6);
    buf.writeUInt16BE(h.authorities.length, offset + 8);
    buf.writeUInt16BE(h.additionals.length, offset + 10);
    return buf;
  };
  header.encode.bytes = 12;
  header.decode = function(buf, offset) {
    if (!offset) offset = 0;
    if (buf.length < 12) throw new Error("Header must be 12 bytes");
    var flags3 = buf.readUInt16BE(offset + 2);
    return {
      id: buf.readUInt16BE(offset),
      type: flags3 & RESPONSE_FLAG ? "response" : "query",
      flags: flags3 & 32767,
      flag_qr: (flags3 >> 15 & 1) === 1,
      opcode: opcodes$1.toString(flags3 >> 11 & 15),
      flag_auth: (flags3 >> 10 & 1) === 1,
      flag_trunc: (flags3 >> 9 & 1) === 1,
      flag_rd: (flags3 >> 8 & 1) === 1,
      flag_ra: (flags3 >> 7 & 1) === 1,
      flag_z: (flags3 >> 6 & 1) === 1,
      flag_ad: (flags3 >> 5 & 1) === 1,
      flag_cd: (flags3 >> 4 & 1) === 1,
      rcode: rcodes$1.toString(flags3 & 15),
      questions: new Array(buf.readUInt16BE(offset + 4)),
      answers: new Array(buf.readUInt16BE(offset + 6)),
      authorities: new Array(buf.readUInt16BE(offset + 8)),
      additionals: new Array(buf.readUInt16BE(offset + 10))
    };
  };
  header.decode.bytes = 12;
  header.encodingLength = function() {
    return 12;
  };
  var runknown = exports.unknown = {};
  runknown.encode = function(data, buf, offset) {
    if (!buf) buf = Buffer2.alloc(runknown.encodingLength(data));
    if (!offset) offset = 0;
    buf.writeUInt16BE(data.length, offset);
    data.copy(buf, offset + 2);
    runknown.encode.bytes = data.length + 2;
    return buf;
  };
  runknown.encode.bytes = 0;
  runknown.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var len = buf.readUInt16BE(offset);
    var data = buf.slice(offset + 2, offset + 2 + len);
    runknown.decode.bytes = len + 2;
    return data;
  };
  runknown.decode.bytes = 0;
  runknown.encodingLength = function(data) {
    return data.length + 2;
  };
  var rns = exports.ns = {};
  rns.encode = function(data, buf, offset) {
    if (!buf) buf = Buffer2.alloc(rns.encodingLength(data));
    if (!offset) offset = 0;
    name.encode(data, buf, offset + 2);
    buf.writeUInt16BE(name.encode.bytes, offset);
    rns.encode.bytes = name.encode.bytes + 2;
    return buf;
  };
  rns.encode.bytes = 0;
  rns.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var len = buf.readUInt16BE(offset);
    var dd = name.decode(buf, offset + 2);
    rns.decode.bytes = len + 2;
    return dd;
  };
  rns.decode.bytes = 0;
  rns.encodingLength = function(data) {
    return name.encodingLength(data) + 2;
  };
  var rsoa = exports.soa = {};
  rsoa.encode = function(data, buf, offset) {
    if (!buf) buf = Buffer2.alloc(rsoa.encodingLength(data));
    if (!offset) offset = 0;
    var oldOffset = offset;
    offset += 2;
    name.encode(data.mname, buf, offset);
    offset += name.encode.bytes;
    name.encode(data.rname, buf, offset);
    offset += name.encode.bytes;
    buf.writeUInt32BE(data.serial || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.refresh || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.retry || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.expire || 0, offset);
    offset += 4;
    buf.writeUInt32BE(data.minimum || 0, offset);
    offset += 4;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    rsoa.encode.bytes = offset - oldOffset;
    return buf;
  };
  rsoa.encode.bytes = 0;
  rsoa.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var oldOffset = offset;
    var data = {};
    offset += 2;
    data.mname = name.decode(buf, offset);
    offset += name.decode.bytes;
    data.rname = name.decode(buf, offset);
    offset += name.decode.bytes;
    data.serial = buf.readUInt32BE(offset);
    offset += 4;
    data.refresh = buf.readUInt32BE(offset);
    offset += 4;
    data.retry = buf.readUInt32BE(offset);
    offset += 4;
    data.expire = buf.readUInt32BE(offset);
    offset += 4;
    data.minimum = buf.readUInt32BE(offset);
    offset += 4;
    rsoa.decode.bytes = offset - oldOffset;
    return data;
  };
  rsoa.decode.bytes = 0;
  rsoa.encodingLength = function(data) {
    return 22 + name.encodingLength(data.mname) + name.encodingLength(data.rname);
  };
  var rtxt = exports.txt = exports.null = {};
  var rnull = rtxt;
  rtxt.encode = function(data, buf, offset) {
    if (!buf) buf = Buffer2.alloc(rtxt.encodingLength(data));
    if (!offset) offset = 0;
    if (typeof data === "string") data = Buffer2.from(data);
    if (!data) data = Buffer2.alloc(0);
    var oldOffset = offset;
    offset += 2;
    var len = data.length;
    data.copy(buf, offset, 0, len);
    offset += len;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    rtxt.encode.bytes = offset - oldOffset;
    return buf;
  };
  rtxt.encode.bytes = 0;
  rtxt.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var oldOffset = offset;
    var len = buf.readUInt16BE(offset);
    offset += 2;
    var data = buf.slice(offset, offset + len);
    offset += len;
    rtxt.decode.bytes = offset - oldOffset;
    return data;
  };
  rtxt.decode.bytes = 0;
  rtxt.encodingLength = function(data) {
    if (!data) return 2;
    return (Buffer2.isBuffer(data) ? data.length : Buffer2.byteLength(data)) + 2;
  };
  var rhinfo = exports.hinfo = {};
  rhinfo.encode = function(data, buf, offset) {
    if (!buf) buf = Buffer2.alloc(rhinfo.encodingLength(data));
    if (!offset) offset = 0;
    var oldOffset = offset;
    offset += 2;
    string.encode(data.cpu, buf, offset);
    offset += string.encode.bytes;
    string.encode(data.os, buf, offset);
    offset += string.encode.bytes;
    buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
    rhinfo.encode.bytes = offset - oldOffset;
    return buf;
  };
  rhinfo.encode.bytes = 0;
  rhinfo.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var oldOffset = offset;
    var data = {};
    offset += 2;
    data.cpu = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.os = string.decode(buf, offset);
    offset += string.decode.bytes;
    rhinfo.decode.bytes = offset - oldOffset;
    return data;
  };
  rhinfo.decode.bytes = 0;
  rhinfo.encodingLength = function(data) {
    return string.encodingLength(data.cpu) + string.encodingLength(data.os) + 2;
  };
  var rptr = exports.ptr = {};
  var rcname = exports.cname = rptr;
  var rdname = exports.dname = rptr;
  rptr.encode = function(data, buf, offset) {
    if (!buf) buf = Buffer2.alloc(rptr.encodingLength(data));
    if (!offset) offset = 0;
    name.encode(data, buf, offset + 2);
    buf.writeUInt16BE(name.encode.bytes, offset);
    rptr.encode.bytes = name.encode.bytes + 2;
    return buf;
  };
  rptr.encode.bytes = 0;
  rptr.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var data = name.decode(buf, offset + 2);
    rptr.decode.bytes = name.decode.bytes + 2;
    return data;
  };
  rptr.decode.bytes = 0;
  rptr.encodingLength = function(data) {
    return name.encodingLength(data) + 2;
  };
  var rsrv = exports.srv = {};
  rsrv.encode = function(data, buf, offset) {
    if (!buf) buf = Buffer2.alloc(rsrv.encodingLength(data));
    if (!offset) offset = 0;
    buf.writeUInt16BE(data.priority || 0, offset + 2);
    buf.writeUInt16BE(data.weight || 0, offset + 4);
    buf.writeUInt16BE(data.port || 0, offset + 6);
    name.encode(data.target, buf, offset + 8);
    var len = name.encode.bytes + 6;
    buf.writeUInt16BE(len, offset);
    rsrv.encode.bytes = len + 2;
    return buf;
  };
  rsrv.encode.bytes = 0;
  rsrv.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var len = buf.readUInt16BE(offset);
    var data = {};
    data.priority = buf.readUInt16BE(offset + 2);
    data.weight = buf.readUInt16BE(offset + 4);
    data.port = buf.readUInt16BE(offset + 6);
    data.target = name.decode(buf, offset + 8);
    rsrv.decode.bytes = len + 2;
    return data;
  };
  rsrv.decode.bytes = 0;
  rsrv.encodingLength = function(data) {
    return 8 + name.encodingLength(data.target);
  };
  var rcaa = exports.caa = {};
  rcaa.ISSUER_CRITICAL = 1 << 7;
  rcaa.encode = function(data, buf, offset) {
    var len = rcaa.encodingLength(data);
    if (!buf) buf = Buffer2.alloc(rcaa.encodingLength(data));
    if (!offset) offset = 0;
    if (data.issuerCritical) {
      data.flags = rcaa.ISSUER_CRITICAL;
    }
    buf.writeUInt16BE(len - 2, offset);
    offset += 2;
    buf.writeUInt8(data.flags || 0, offset);
    offset += 1;
    string.encode(data.tag, buf, offset);
    offset += string.encode.bytes;
    buf.write(data.value, offset);
    offset += Buffer2.byteLength(data.value);
    rcaa.encode.bytes = len;
    return buf;
  };
  rcaa.encode.bytes = 0;
  rcaa.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var len = buf.readUInt16BE(offset);
    offset += 2;
    var oldOffset = offset;
    var data = {};
    data.flags = buf.readUInt8(offset);
    offset += 1;
    data.tag = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.value = buf.toString("utf-8", offset, oldOffset + len);
    data.issuerCritical = !!(data.flags & rcaa.ISSUER_CRITICAL);
    rcaa.decode.bytes = len + 2;
    return data;
  };
  rcaa.decode.bytes = 0;
  rcaa.encodingLength = function(data) {
    return string.encodingLength(data.tag) + string.encodingLength(data.value) + 2;
  };
  var ra = exports.a = {};
  ra.encode = function(host, buf, offset) {
    if (!buf) buf = Buffer2.alloc(ra.encodingLength(host));
    if (!offset) offset = 0;
    buf.writeUInt16BE(4, offset);
    offset += 2;
    ip$1.toBuffer(host, buf, offset);
    ra.encode.bytes = 6;
    return buf;
  };
  ra.encode.bytes = 0;
  ra.decode = function(buf, offset) {
    if (!offset) offset = 0;
    offset += 2;
    var host = ip$1.toString(buf, offset, 4);
    ra.decode.bytes = 6;
    return host;
  };
  ra.decode.bytes = 0;
  ra.encodingLength = function() {
    return 6;
  };
  var raaaa = exports.aaaa = {};
  raaaa.encode = function(host, buf, offset) {
    if (!buf) buf = Buffer2.alloc(raaaa.encodingLength(host));
    if (!offset) offset = 0;
    buf.writeUInt16BE(16, offset);
    offset += 2;
    ip$1.toBuffer(host, buf, offset);
    raaaa.encode.bytes = 18;
    return buf;
  };
  raaaa.encode.bytes = 0;
  raaaa.decode = function(buf, offset) {
    if (!offset) offset = 0;
    offset += 2;
    var host = ip$1.toString(buf, offset, 16);
    raaaa.decode.bytes = 18;
    return host;
  };
  raaaa.decode.bytes = 0;
  raaaa.encodingLength = function() {
    return 18;
  };
  var renc = exports.record = function(type2) {
    switch (type2.toUpperCase()) {
      case "A":
        return ra;
      case "PTR":
        return rptr;
      case "CNAME":
        return rcname;
      case "DNAME":
        return rdname;
      case "TXT":
        return rtxt;
      case "NULL":
        return rnull;
      case "AAAA":
        return raaaa;
      case "SRV":
        return rsrv;
      case "HINFO":
        return rhinfo;
      case "CAA":
        return rcaa;
      case "NS":
        return rns;
      case "SOA":
        return rsoa;
    }
    return runknown;
  };
  var answer = exports.answer = {};
  answer.encode = function(a, buf, offset) {
    if (!buf) buf = Buffer2.alloc(answer.encodingLength(a));
    if (!offset) offset = 0;
    var oldOffset = offset;
    name.encode(a.name, buf, offset);
    offset += name.encode.bytes;
    buf.writeUInt16BE(types$1.toType(a.type), offset);
    var klass = a.class === void 0 ? 1 : a.class;
    if (a.flush) klass |= FLUSH_MASK;
    buf.writeUInt16BE(klass, offset + 2);
    buf.writeUInt32BE(a.ttl || 0, offset + 4);
    var enc = renc(a.type);
    enc.encode(a.data, buf, offset + 8);
    offset += 8 + enc.encode.bytes;
    answer.encode.bytes = offset - oldOffset;
    return buf;
  };
  answer.encode.bytes = 0;
  answer.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var a = {};
    var oldOffset = offset;
    a.name = name.decode(buf, offset);
    offset += name.decode.bytes;
    a.type = types$1.toString(buf.readUInt16BE(offset));
    a.class = buf.readUInt16BE(offset + 2);
    a.ttl = buf.readUInt32BE(offset + 4);
    a.flush = !!(a.class & FLUSH_MASK);
    if (a.flush) a.class &= NOT_FLUSH_MASK;
    var enc = renc(a.type);
    a.data = enc.decode(buf, offset + 8);
    offset += 8 + enc.decode.bytes;
    answer.decode.bytes = offset - oldOffset;
    return a;
  };
  answer.decode.bytes = 0;
  answer.encodingLength = function(a) {
    return name.encodingLength(a.name) + 8 + renc(a.type).encodingLength(a.data);
  };
  var question = exports.question = {};
  question.encode = function(q, buf, offset) {
    if (!buf) buf = Buffer2.alloc(question.encodingLength(q));
    if (!offset) offset = 0;
    var oldOffset = offset;
    name.encode(q.name, buf, offset);
    offset += name.encode.bytes;
    buf.writeUInt16BE(types$1.toType(q.type), offset);
    offset += 2;
    buf.writeUInt16BE(q.class === void 0 ? 1 : q.class, offset);
    offset += 2;
    question.encode.bytes = offset - oldOffset;
    return q;
  };
  question.encode.bytes = 0;
  question.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var oldOffset = offset;
    var q = {};
    q.name = name.decode(buf, offset);
    offset += name.decode.bytes;
    q.type = types$1.toString(buf.readUInt16BE(offset));
    offset += 2;
    q.class = buf.readUInt16BE(offset);
    offset += 2;
    var qu = !!(q.class & QU_MASK);
    if (qu) q.class &= NOT_QU_MASK;
    question.decode.bytes = offset - oldOffset;
    return q;
  };
  question.decode.bytes = 0;
  question.encodingLength = function(q) {
    return name.encodingLength(q.name) + 4;
  };
  exports.AUTHORITATIVE_ANSWER = 1 << 10;
  exports.TRUNCATED_RESPONSE = 1 << 9;
  exports.RECURSION_DESIRED = 1 << 8;
  exports.RECURSION_AVAILABLE = 1 << 7;
  exports.AUTHENTIC_DATA = 1 << 5;
  exports.CHECKING_DISABLED = 1 << 4;
  exports.encode = function(result, buf, offset) {
    var allocing = !buf;
    if (allocing) buf = Buffer2.alloc(exports.encodingLength(result));
    if (!offset) offset = 0;
    var oldOffset = offset;
    if (!result.questions) result.questions = [];
    if (!result.answers) result.answers = [];
    if (!result.authorities) result.authorities = [];
    if (!result.additionals) result.additionals = [];
    header.encode(result, buf, offset);
    offset += header.encode.bytes;
    offset = encodeList(result.questions, question, buf, offset);
    offset = encodeList(result.answers, answer, buf, offset);
    offset = encodeList(result.authorities, answer, buf, offset);
    offset = encodeList(result.additionals, answer, buf, offset);
    exports.encode.bytes = offset - oldOffset;
    if (allocing && exports.encode.bytes !== buf.length) {
      return buf.slice(0, exports.encode.bytes);
    }
    return buf;
  };
  exports.encode.bytes = 0;
  exports.decode = function(buf, offset) {
    if (!offset) offset = 0;
    var oldOffset = offset;
    var result = header.decode(buf, offset);
    offset += header.decode.bytes;
    offset = decodeList(result.questions, question, buf, offset);
    offset = decodeList(result.answers, answer, buf, offset);
    offset = decodeList(result.authorities, answer, buf, offset);
    offset = decodeList(result.additionals, answer, buf, offset);
    exports.decode.bytes = offset - oldOffset;
    return result;
  };
  exports.decode.bytes = 0;
  exports.encodingLength = function(result) {
    return header.encodingLength(result) + encodingLengthList(result.questions || [], question) + encodingLengthList(result.answers || [], answer) + encodingLengthList(result.authorities || [], answer) + encodingLengthList(result.additionals || [], answer);
  };
  function encodingLengthList(list, enc) {
    var len = 0;
    for (var i = 0; i < list.length; i++) len += enc.encodingLength(list[i]);
    return len;
  }
  function encodeList(list, enc, buf, offset) {
    for (var i = 0; i < list.length; i++) {
      enc.encode(list[i], buf, offset);
      offset += enc.encode.bytes;
    }
    return offset;
  }
  function decodeList(list, enc, buf, offset) {
    for (var i = 0; i < list.length; i++) {
      list[i] = enc.decode(buf, offset);
      offset += enc.decode.bytes;
    }
    return offset;
  }
})(dnsPacket);
var nextTick = nextTickArgs;
process.nextTick(upgrade, 42);
var thunky_1 = thunky$1;
function thunky$1(fn2) {
  var state = run;
  return thunk;
  function thunk(callback) {
    state(callback || noop$1);
  }
  function run(callback) {
    var stack = [callback];
    state = wait;
    fn2(done);
    function wait(callback2) {
      stack.push(callback2);
    }
    function done(err) {
      var args = arguments;
      state = isError(err) ? run : finished;
      while (stack.length) finished(stack.shift());
      function finished(callback2) {
        nextTick(apply, callback2, args);
      }
    }
  }
}
function isError(err) {
  return Object.prototype.toString.call(err) === "[object Error]";
}
function noop$1() {
}
function apply(callback, args) {
  callback.apply(null, args);
}
function upgrade(val) {
  if (val === 42) nextTick = process.nextTick;
}
function nextTickArgs(fn2, a, b) {
  process.nextTick(function() {
    fn2(a, b);
  });
}
var packet = dnsPacket;
var dgram = require$$1$1;
var thunky = thunky_1;
var events = require$$2;
var os = require$$0;
var noop = function() {
};
var multicastDns = function(opts) {
  if (!opts) opts = {};
  var that = new events.EventEmitter();
  var port = typeof opts.port === "number" ? opts.port : 5353;
  var type2 = opts.type || "udp4";
  var ip2 = opts.ip || opts.host || (type2 === "udp4" ? "224.0.0.251" : null);
  var me = { address: ip2, port };
  var memberships = {};
  var destroyed = false;
  var interval = null;
  if (type2 === "udp6" && (!ip2 || !opts.interface)) {
    throw new Error("For IPv6 multicast you must specify `ip` and `interface`");
  }
  var socket = opts.socket || dgram.createSocket({
    type: type2,
    reuseAddr: opts.reuseAddr !== false,
    toString: function() {
      return type2;
    }
  });
  socket.on("error", function(err) {
    if (err.code === "EACCES" || err.code === "EADDRINUSE") that.emit("error", err);
    else that.emit("warning", err);
  });
  socket.on("message", function(message, rinfo) {
    try {
      message = packet.decode(message);
    } catch (err) {
      that.emit("warning", err);
      return;
    }
    that.emit("packet", message, rinfo);
    if (message.type === "query") that.emit("query", message, rinfo);
    if (message.type === "response") that.emit("response", message, rinfo);
  });
  socket.on("listening", function() {
    if (!port) port = me.port = socket.address().port;
    if (opts.multicast !== false) {
      that.update();
      interval = setInterval(that.update, 5e3);
      socket.setMulticastTTL(opts.ttl || 255);
      socket.setMulticastLoopback(opts.loopback !== false);
    }
  });
  var bind3 = thunky(function(cb) {
    if (!port) return cb(null);
    socket.once("error", cb);
    socket.bind(port, opts.interface, function() {
      socket.removeListener("error", cb);
      cb(null);
    });
  });
  bind3(function(err) {
    if (err) return that.emit("error", err);
    that.emit("ready");
  });
  that.send = function(value, rinfo, cb) {
    if (typeof rinfo === "function") return that.send(value, null, rinfo);
    if (!cb) cb = noop;
    if (!rinfo) rinfo = me;
    bind3(onbind);
    function onbind(err) {
      if (destroyed) return cb();
      if (err) return cb(err);
      var message = packet.encode(value);
      socket.send(message, 0, message.length, rinfo.port, rinfo.address || rinfo.host, cb);
    }
  };
  that.response = that.respond = function(res, rinfo, cb) {
    if (Array.isArray(res)) res = { answers: res };
    res.type = "response";
    res.flags = (res.flags || 0) | packet.AUTHORITATIVE_ANSWER;
    that.send(res, rinfo, cb);
  };
  that.query = function(q, type3, rinfo, cb) {
    if (typeof type3 === "function") return that.query(q, null, null, type3);
    if (typeof type3 === "object" && type3 && type3.port) return that.query(q, null, type3, rinfo);
    if (typeof rinfo === "function") return that.query(q, type3, null, rinfo);
    if (!cb) cb = noop;
    if (typeof q === "string") q = [{ name: q, type: type3 || "ANY" }];
    if (Array.isArray(q)) q = { type: "query", questions: q };
    q.type = "query";
    that.send(q, rinfo, cb);
  };
  that.destroy = function(cb) {
    if (!cb) cb = noop;
    if (destroyed) return process.nextTick(cb);
    destroyed = true;
    clearInterval(interval);
    socket.once("close", cb);
    socket.close();
  };
  that.update = function() {
    var ifaces = opts.interface ? [].concat(opts.interface) : allInterfaces();
    var updated = false;
    for (var i = 0; i < ifaces.length; i++) {
      var addr = ifaces[i];
      if (memberships[addr]) continue;
      memberships[addr] = true;
      updated = true;
      try {
        socket.addMembership(ip2, addr);
      } catch (err) {
        that.emit("warning", err);
      }
    }
    if (!updated || !socket.setMulticastInterface) return;
    socket.setMulticastInterface(opts.interface || defaultInterface());
  };
  return that;
};
function defaultInterface() {
  var networks = os.networkInterfaces();
  var names = Object.keys(networks);
  for (var i = 0; i < names.length; i++) {
    var net = networks[names[i]];
    for (var j = 0; j < net.length; j++) {
      var iface = net[j];
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}
function allInterfaces() {
  var networks = os.networkInterfaces();
  var names = Object.keys(networks);
  var res = [];
  for (var i = 0; i < names.length; i++) {
    var net = networks[names[i]];
    for (var j = 0; j < net.length; j++) {
      var iface = net[j];
      if (iface.family === "IPv4") {
        res.push(iface.address);
        break;
      }
    }
  }
  return res;
}
var toStr$3 = Object.prototype.toString;
var isArguments$2 = function isArguments(value) {
  var str = toStr$3.call(value);
  var isArgs2 = str === "[object Arguments]";
  if (!isArgs2) {
    isArgs2 = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr$3.call(value.callee) === "[object Function]";
  }
  return isArgs2;
};
var implementation$8;
var hasRequiredImplementation;
function requireImplementation() {
  if (hasRequiredImplementation) return implementation$8;
  hasRequiredImplementation = 1;
  var keysShim2;
  if (!Object.keys) {
    var has = Object.prototype.hasOwnProperty;
    var toStr2 = Object.prototype.toString;
    var isArgs2 = isArguments$2;
    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var hasDontEnumBug = !isEnumerable.call({ toString: null }, "toString");
    var hasProtoEnumBug = isEnumerable.call(function() {
    }, "prototype");
    var dontEnums = [
      "toString",
      "toLocaleString",
      "valueOf",
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "constructor"
    ];
    var equalsConstructorPrototype = function(o) {
      var ctor = o.constructor;
      return ctor && ctor.prototype === o;
    };
    var excludedKeys = {
      $applicationCache: true,
      $console: true,
      $external: true,
      $frame: true,
      $frameElement: true,
      $frames: true,
      $innerHeight: true,
      $innerWidth: true,
      $onmozfullscreenchange: true,
      $onmozfullscreenerror: true,
      $outerHeight: true,
      $outerWidth: true,
      $pageXOffset: true,
      $pageYOffset: true,
      $parent: true,
      $scrollLeft: true,
      $scrollTop: true,
      $scrollX: true,
      $scrollY: true,
      $self: true,
      $webkitIndexedDB: true,
      $webkitStorageInfo: true,
      $window: true
    };
    var hasAutomationEqualityBug = function() {
      if (typeof window === "undefined") {
        return false;
      }
      for (var k in window) {
        try {
          if (!excludedKeys["$" + k] && has.call(window, k) && window[k] !== null && typeof window[k] === "object") {
            try {
              equalsConstructorPrototype(window[k]);
            } catch (e) {
              return true;
            }
          }
        } catch (e) {
          return true;
        }
      }
      return false;
    }();
    var equalsConstructorPrototypeIfNotBuggy = function(o) {
      if (typeof window === "undefined" || !hasAutomationEqualityBug) {
        return equalsConstructorPrototype(o);
      }
      try {
        return equalsConstructorPrototype(o);
      } catch (e) {
        return false;
      }
    };
    keysShim2 = function keys3(object) {
      var isObject = object !== null && typeof object === "object";
      var isFunction2 = toStr2.call(object) === "[object Function]";
      var isArguments5 = isArgs2(object);
      var isString = isObject && toStr2.call(object) === "[object String]";
      var theKeys = [];
      if (!isObject && !isFunction2 && !isArguments5) {
        throw new TypeError("Object.keys called on a non-object");
      }
      var skipProto = hasProtoEnumBug && isFunction2;
      if (isString && object.length > 0 && !has.call(object, 0)) {
        for (var i = 0; i < object.length; ++i) {
          theKeys.push(String(i));
        }
      }
      if (isArguments5 && object.length > 0) {
        for (var j = 0; j < object.length; ++j) {
          theKeys.push(String(j));
        }
      } else {
        for (var name in object) {
          if (!(skipProto && name === "prototype") && has.call(object, name)) {
            theKeys.push(String(name));
          }
        }
      }
      if (hasDontEnumBug) {
        var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
        for (var k = 0; k < dontEnums.length; ++k) {
          if (!(skipConstructor && dontEnums[k] === "constructor") && has.call(object, dontEnums[k])) {
            theKeys.push(dontEnums[k]);
          }
        }
      }
      return theKeys;
    };
  }
  implementation$8 = keysShim2;
  return implementation$8;
}
var slice = Array.prototype.slice;
var isArgs = isArguments$2;
var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) {
  return origKeys(o);
} : requireImplementation();
var originalKeys = Object.keys;
keysShim.shim = function shimObjectKeys() {
  if (Object.keys) {
    var keysWorksWithArguments = function() {
      var args = Object.keys(arguments);
      return args && args.length === arguments.length;
    }(1, 2);
    if (!keysWorksWithArguments) {
      Object.keys = function keys3(object) {
        if (isArgs(object)) {
          return originalKeys(slice.call(object));
        }
        return originalKeys(object);
      };
    }
  } else {
    Object.keys = keysShim;
  }
  return Object.keys || keysShim;
};
var objectKeys$1 = keysShim;
var shams$1 = function hasSymbols() {
  if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
    return false;
  }
  if (typeof Symbol.iterator === "symbol") {
    return true;
  }
  var obj = {};
  var sym = Symbol("test");
  var symObj = Object(sym);
  if (typeof sym === "string") {
    return false;
  }
  if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
    return false;
  }
  if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
    return false;
  }
  var symVal = 42;
  obj[sym] = symVal;
  for (var _ in obj) {
    return false;
  }
  if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
    return false;
  }
  if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
    return false;
  }
  var syms = Object.getOwnPropertySymbols(obj);
  if (syms.length !== 1 || syms[0] !== sym) {
    return false;
  }
  if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
    return false;
  }
  if (typeof Object.getOwnPropertyDescriptor === "function") {
    var descriptor = (
      /** @type {PropertyDescriptor} */
      Object.getOwnPropertyDescriptor(obj, sym)
    );
    if (descriptor.value !== symVal || descriptor.enumerable !== true) {
      return false;
    }
  }
  return true;
};
var hasSymbols$3 = shams$1;
var shams = function hasToStringTagShams() {
  return hasSymbols$3() && !!Symbol.toStringTag;
};
var esObjectAtoms = Object;
var esErrors = Error;
var _eval = EvalError;
var range = RangeError;
var ref = ReferenceError;
var syntax = SyntaxError;
var type = TypeError;
var uri = URIError;
var abs$1 = Math.abs;
var floor$1 = Math.floor;
var max$2 = Math.max;
var min$1 = Math.min;
var pow$1 = Math.pow;
var round$1 = Math.round;
var _isNaN = Number.isNaN || function isNaN2(a) {
  return a !== a;
};
var $isNaN = _isNaN;
var sign$1 = function sign(number) {
  if ($isNaN(number) || number === 0) {
    return number;
  }
  return number < 0 ? -1 : 1;
};
var gOPD$5 = Object.getOwnPropertyDescriptor;
var $gOPD$2 = gOPD$5;
if ($gOPD$2) {
  try {
    $gOPD$2([], "length");
  } catch (e) {
    $gOPD$2 = null;
  }
}
var gopd$1 = $gOPD$2;
var $defineProperty$3 = Object.defineProperty || false;
if ($defineProperty$3) {
  try {
    $defineProperty$3({}, "a", { value: 1 });
  } catch (e) {
    $defineProperty$3 = false;
  }
}
var esDefineProperty = $defineProperty$3;
var hasSymbols$2;
var hasRequiredHasSymbols;
function requireHasSymbols() {
  if (hasRequiredHasSymbols) return hasSymbols$2;
  hasRequiredHasSymbols = 1;
  var origSymbol = typeof Symbol !== "undefined" && Symbol;
  var hasSymbolSham = shams$1;
  hasSymbols$2 = function hasNativeSymbols() {
    if (typeof origSymbol !== "function") {
      return false;
    }
    if (typeof Symbol !== "function") {
      return false;
    }
    if (typeof origSymbol("foo") !== "symbol") {
      return false;
    }
    if (typeof Symbol("bar") !== "symbol") {
      return false;
    }
    return hasSymbolSham();
  };
  return hasSymbols$2;
}
var Reflect_getPrototypeOf = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
var $Object$3 = esObjectAtoms;
var Object_getPrototypeOf = $Object$3.getPrototypeOf || null;
var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
var toStr$2 = Object.prototype.toString;
var max$1 = Math.max;
var funcType = "[object Function]";
var concatty = function concatty2(a, b) {
  var arr = [];
  for (var i = 0; i < a.length; i += 1) {
    arr[i] = a[i];
  }
  for (var j = 0; j < b.length; j += 1) {
    arr[j + a.length] = b[j];
  }
  return arr;
};
var slicy = function slicy2(arrLike, offset) {
  var arr = [];
  for (var i = offset, j = 0; i < arrLike.length; i += 1, j += 1) {
    arr[j] = arrLike[i];
  }
  return arr;
};
var joiny = function(arr, joiner) {
  var str = "";
  for (var i = 0; i < arr.length; i += 1) {
    str += arr[i];
    if (i + 1 < arr.length) {
      str += joiner;
    }
  }
  return str;
};
var implementation$7 = function bind(that) {
  var target = this;
  if (typeof target !== "function" || toStr$2.apply(target) !== funcType) {
    throw new TypeError(ERROR_MESSAGE + target);
  }
  var args = slicy(arguments, 1);
  var bound;
  var binder = function() {
    if (this instanceof bound) {
      var result = target.apply(
        this,
        concatty(args, arguments)
      );
      if (Object(result) === result) {
        return result;
      }
      return this;
    }
    return target.apply(
      that,
      concatty(args, arguments)
    );
  };
  var boundLength = max$1(0, target.length - args.length);
  var boundArgs = [];
  for (var i = 0; i < boundLength; i++) {
    boundArgs[i] = "$" + i;
  }
  bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
  if (target.prototype) {
    var Empty = function Empty2() {
    };
    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }
  return bound;
};
var implementation$6 = implementation$7;
var functionBind = Function.prototype.bind || implementation$6;
var functionCall = Function.prototype.call;
var functionApply = Function.prototype.apply;
var reflectApply = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
var bind$4 = functionBind;
var $apply$2 = functionApply;
var $call$2 = functionCall;
var $reflectApply = reflectApply;
var actualApply$1 = $reflectApply || bind$4.call($call$2, $apply$2);
var bind$3 = functionBind;
var $TypeError$6 = type;
var $call$1 = functionCall;
var $actualApply = actualApply$1;
var callBindApplyHelpers = function callBindBasic(args) {
  if (args.length < 1 || typeof args[0] !== "function") {
    throw new $TypeError$6("a function is required");
  }
  return $actualApply(bind$3, $call$1, args);
};
var callBind$3 = callBindApplyHelpers;
var gOPD$4 = gopd$1;
var hasProtoAccessor;
try {
  hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
  [].__proto__ === Array.prototype;
} catch (e) {
  if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
    throw e;
  }
}
var desc = !!hasProtoAccessor && gOPD$4 && gOPD$4(
  Object.prototype,
  /** @type {keyof typeof Object.prototype} */
  "__proto__"
);
var $Object$2 = Object;
var $getPrototypeOf = $Object$2.getPrototypeOf;
var get = desc && typeof desc.get === "function" ? callBind$3([desc.get]) : typeof $getPrototypeOf === "function" ? (
  /** @type {import('./get')} */
  function getDunder(value) {
    return $getPrototypeOf(value == null ? value : $Object$2(value));
  }
) : false;
var reflectGetProto = Reflect_getPrototypeOf;
var originalGetProto = Object_getPrototypeOf;
var getDunderProto = get;
var getProto$2 = reflectGetProto ? function getProto(O) {
  return reflectGetProto(O);
} : originalGetProto ? function getProto2(O) {
  if (!O || typeof O !== "object" && typeof O !== "function") {
    throw new TypeError("getProto: not an object");
  }
  return originalGetProto(O);
} : getDunderProto ? function getProto3(O) {
  return getDunderProto(O);
} : null;
var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind$2 = functionBind;
var hasown = bind$2.call(call, $hasOwn);
var undefined$1;
var $Object$1 = esObjectAtoms;
var $Error = esErrors;
var $EvalError = _eval;
var $RangeError = range;
var $ReferenceError = ref;
var $SyntaxError$1 = syntax;
var $TypeError$5 = type;
var $URIError = uri;
var abs = abs$1;
var floor = floor$1;
var max = max$2;
var min = min$1;
var pow = pow$1;
var round = round$1;
var sign2 = sign$1;
var $Function = Function;
var getEvalledConstructor = function(expressionSyntax) {
  try {
    return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
  } catch (e) {
  }
};
var $gOPD$1 = gopd$1;
var $defineProperty$2 = esDefineProperty;
var throwTypeError = function() {
  throw new $TypeError$5();
};
var ThrowTypeError = $gOPD$1 ? function() {
  try {
    arguments.callee;
    return throwTypeError;
  } catch (calleeThrows) {
    try {
      return $gOPD$1(arguments, "callee").get;
    } catch (gOPDthrows) {
      return throwTypeError;
    }
  }
}() : throwTypeError;
var hasSymbols$1 = requireHasSymbols()();
var getProto$1 = getProto$2;
var $ObjectGPO = Object_getPrototypeOf;
var $ReflectGPO = Reflect_getPrototypeOf;
var $apply$1 = functionApply;
var $call = functionCall;
var needsEval = {};
var TypedArray = typeof Uint8Array === "undefined" || !getProto$1 ? undefined$1 : getProto$1(Uint8Array);
var INTRINSICS = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
  "%ArrayIteratorPrototype%": hasSymbols$1 && getProto$1 ? getProto$1([][Symbol.iterator]()) : undefined$1,
  "%AsyncFromSyncIteratorPrototype%": undefined$1,
  "%AsyncFunction%": needsEval,
  "%AsyncGenerator%": needsEval,
  "%AsyncGeneratorFunction%": needsEval,
  "%AsyncIteratorPrototype%": needsEval,
  "%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
  "%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
  "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": $Error,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": $EvalError,
  "%Float16Array%": typeof Float16Array === "undefined" ? undefined$1 : Float16Array,
  "%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
  "%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
  "%Function%": $Function,
  "%GeneratorFunction%": needsEval,
  "%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
  "%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
  "%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": hasSymbols$1 && getProto$1 ? getProto$1(getProto$1([][Symbol.iterator]())) : undefined$1,
  "%JSON%": typeof JSON === "object" ? JSON : undefined$1,
  "%Map%": typeof Map === "undefined" ? undefined$1 : Map,
  "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols$1 || !getProto$1 ? undefined$1 : getProto$1((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": $Object$1,
  "%Object.getOwnPropertyDescriptor%": $gOPD$1,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
  "%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
  "%RangeError%": $RangeError,
  "%ReferenceError%": $ReferenceError,
  "%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set === "undefined" ? undefined$1 : Set,
  "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols$1 || !getProto$1 ? undefined$1 : getProto$1((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": hasSymbols$1 && getProto$1 ? getProto$1(""[Symbol.iterator]()) : undefined$1,
  "%Symbol%": hasSymbols$1 ? Symbol : undefined$1,
  "%SyntaxError%": $SyntaxError$1,
  "%ThrowTypeError%": ThrowTypeError,
  "%TypedArray%": TypedArray,
  "%TypeError%": $TypeError$5,
  "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
  "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
  "%URIError%": $URIError,
  "%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
  "%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
  "%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet,
  "%Function.prototype.call%": $call,
  "%Function.prototype.apply%": $apply$1,
  "%Object.defineProperty%": $defineProperty$2,
  "%Object.getPrototypeOf%": $ObjectGPO,
  "%Math.abs%": abs,
  "%Math.floor%": floor,
  "%Math.max%": max,
  "%Math.min%": min,
  "%Math.pow%": pow,
  "%Math.round%": round,
  "%Math.sign%": sign2,
  "%Reflect.getPrototypeOf%": $ReflectGPO
};
if (getProto$1) {
  try {
    null.error;
  } catch (e) {
    var errorProto = getProto$1(getProto$1(e));
    INTRINSICS["%Error.prototype%"] = errorProto;
  }
}
var doEval = function doEval2(name) {
  var value;
  if (name === "%AsyncFunction%") {
    value = getEvalledConstructor("async function () {}");
  } else if (name === "%GeneratorFunction%") {
    value = getEvalledConstructor("function* () {}");
  } else if (name === "%AsyncGeneratorFunction%") {
    value = getEvalledConstructor("async function* () {}");
  } else if (name === "%AsyncGenerator%") {
    var fn2 = doEval2("%AsyncGeneratorFunction%");
    if (fn2) {
      value = fn2.prototype;
    }
  } else if (name === "%AsyncIteratorPrototype%") {
    var gen = doEval2("%AsyncGenerator%");
    if (gen && getProto$1) {
      value = getProto$1(gen.prototype);
    }
  }
  INTRINSICS[name] = value;
  return value;
};
var LEGACY_ALIASES = {
  __proto__: null,
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
};
var bind$1 = functionBind;
var hasOwn$1 = hasown;
var $concat = bind$1.call($call, Array.prototype.concat);
var $spliceApply = bind$1.call($apply$1, Array.prototype.splice);
var $replace = bind$1.call($call, String.prototype.replace);
var $strSlice = bind$1.call($call, String.prototype.slice);
var $exec$1 = bind$1.call($call, RegExp.prototype.exec);
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = function stringToPath2(string) {
  var first = $strSlice(string, 0, 1);
  var last = $strSlice(string, -1);
  if (first === "%" && last !== "%") {
    throw new $SyntaxError$1("invalid intrinsic syntax, expected closing `%`");
  } else if (last === "%" && first !== "%") {
    throw new $SyntaxError$1("invalid intrinsic syntax, expected opening `%`");
  }
  var result = [];
  $replace(string, rePropName, function(match, number, quote, subString) {
    result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
  });
  return result;
};
var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
  var intrinsicName = name;
  var alias;
  if (hasOwn$1(LEGACY_ALIASES, intrinsicName)) {
    alias = LEGACY_ALIASES[intrinsicName];
    intrinsicName = "%" + alias[0] + "%";
  }
  if (hasOwn$1(INTRINSICS, intrinsicName)) {
    var value = INTRINSICS[intrinsicName];
    if (value === needsEval) {
      value = doEval(intrinsicName);
    }
    if (typeof value === "undefined" && !allowMissing) {
      throw new $TypeError$5("intrinsic " + name + " exists, but is not available. Please file an issue!");
    }
    return {
      alias,
      name: intrinsicName,
      value
    };
  }
  throw new $SyntaxError$1("intrinsic " + name + " does not exist!");
};
var getIntrinsic = function GetIntrinsic(name, allowMissing) {
  if (typeof name !== "string" || name.length === 0) {
    throw new $TypeError$5("intrinsic name must be a non-empty string");
  }
  if (arguments.length > 1 && typeof allowMissing !== "boolean") {
    throw new $TypeError$5('"allowMissing" argument must be a boolean');
  }
  if ($exec$1(/^%?[^%]*%?$/, name) === null) {
    throw new $SyntaxError$1("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  }
  var parts = stringToPath(name);
  var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
  var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
  var intrinsicRealName = intrinsic.name;
  var value = intrinsic.value;
  var skipFurtherCaching = false;
  var alias = intrinsic.alias;
  if (alias) {
    intrinsicBaseName = alias[0];
    $spliceApply(parts, $concat([0, 1], alias));
  }
  for (var i = 1, isOwn = true; i < parts.length; i += 1) {
    var part = parts[i];
    var first = $strSlice(part, 0, 1);
    var last = $strSlice(part, -1);
    if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
      throw new $SyntaxError$1("property names with quotes must have matching quotes");
    }
    if (part === "constructor" || !isOwn) {
      skipFurtherCaching = true;
    }
    intrinsicBaseName += "." + part;
    intrinsicRealName = "%" + intrinsicBaseName + "%";
    if (hasOwn$1(INTRINSICS, intrinsicRealName)) {
      value = INTRINSICS[intrinsicRealName];
    } else if (value != null) {
      if (!(part in value)) {
        if (!allowMissing) {
          throw new $TypeError$5("base intrinsic for " + name + " exists, but the property is not available.");
        }
        return void 0;
      }
      if ($gOPD$1 && i + 1 >= parts.length) {
        var desc2 = $gOPD$1(value, part);
        isOwn = !!desc2;
        if (isOwn && "get" in desc2 && !("originalValue" in desc2.get)) {
          value = desc2.get;
        } else {
          value = value[part];
        }
      } else {
        isOwn = hasOwn$1(value, part);
        value = value[part];
      }
      if (isOwn && !skipFurtherCaching) {
        INTRINSICS[intrinsicRealName] = value;
      }
    }
  }
  return value;
};
var GetIntrinsic$1 = getIntrinsic;
var callBindBasic2 = callBindApplyHelpers;
var $indexOf = callBindBasic2([GetIntrinsic$1("%String.prototype.indexOf%")]);
var callBound$3 = function callBoundIntrinsic(name, allowMissing) {
  var intrinsic = (
    /** @type {(this: unknown, ...args: unknown[]) => unknown} */
    GetIntrinsic$1(name, !!allowMissing)
  );
  if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
    return callBindBasic2(
      /** @type {const} */
      [intrinsic]
    );
  }
  return intrinsic;
};
var hasToStringTag$2 = shams();
var callBound$2 = callBound$3;
var $toString$1 = callBound$2("Object.prototype.toString");
var isStandardArguments = function isArguments2(value) {
  if (hasToStringTag$2 && value && typeof value === "object" && Symbol.toStringTag in value) {
    return false;
  }
  return $toString$1(value) === "[object Arguments]";
};
var isLegacyArguments = function isArguments3(value) {
  if (isStandardArguments(value)) {
    return true;
  }
  return value !== null && typeof value === "object" && "length" in value && typeof value.length === "number" && value.length >= 0 && $toString$1(value) !== "[object Array]" && "callee" in value && $toString$1(value.callee) === "[object Function]";
};
var supportsStandardArguments = function() {
  return isStandardArguments(arguments);
}();
isStandardArguments.isLegacyArguments = isLegacyArguments;
var isArguments$1 = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
var $defineProperty$1 = esDefineProperty;
var $SyntaxError = syntax;
var $TypeError$4 = type;
var gopd = gopd$1;
var defineDataProperty$1 = function defineDataProperty(obj, property, value) {
  if (!obj || typeof obj !== "object" && typeof obj !== "function") {
    throw new $TypeError$4("`obj` must be an object or a function`");
  }
  if (typeof property !== "string" && typeof property !== "symbol") {
    throw new $TypeError$4("`property` must be a string or a symbol`");
  }
  if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) {
    throw new $TypeError$4("`nonEnumerable`, if provided, must be a boolean or null");
  }
  if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) {
    throw new $TypeError$4("`nonWritable`, if provided, must be a boolean or null");
  }
  if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) {
    throw new $TypeError$4("`nonConfigurable`, if provided, must be a boolean or null");
  }
  if (arguments.length > 6 && typeof arguments[6] !== "boolean") {
    throw new $TypeError$4("`loose`, if provided, must be a boolean");
  }
  var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
  var nonWritable = arguments.length > 4 ? arguments[4] : null;
  var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
  var loose = arguments.length > 6 ? arguments[6] : false;
  var desc2 = !!gopd && gopd(obj, property);
  if ($defineProperty$1) {
    $defineProperty$1(obj, property, {
      configurable: nonConfigurable === null && desc2 ? desc2.configurable : !nonConfigurable,
      enumerable: nonEnumerable === null && desc2 ? desc2.enumerable : !nonEnumerable,
      value,
      writable: nonWritable === null && desc2 ? desc2.writable : !nonWritable
    });
  } else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) {
    obj[property] = value;
  } else {
    throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
  }
};
var $defineProperty = esDefineProperty;
var hasPropertyDescriptors = function hasPropertyDescriptors2() {
  return !!$defineProperty;
};
hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
  if (!$defineProperty) {
    return null;
  }
  try {
    return $defineProperty([], "length", { value: 1 }).length !== 1;
  } catch (e) {
    return true;
  }
};
var hasPropertyDescriptors_1 = hasPropertyDescriptors;
var keys2 = objectKeys$1;
var hasSymbols2 = typeof Symbol === "function" && typeof Symbol("foo") === "symbol";
var toStr$1 = Object.prototype.toString;
var concat = Array.prototype.concat;
var defineDataProperty2 = defineDataProperty$1;
var isFunction = function(fn2) {
  return typeof fn2 === "function" && toStr$1.call(fn2) === "[object Function]";
};
var supportsDescriptors$2 = hasPropertyDescriptors_1();
var defineProperty$1 = function(object, name, value, predicate) {
  if (name in object) {
    if (predicate === true) {
      if (object[name] === value) {
        return;
      }
    } else if (!isFunction(predicate) || !predicate()) {
      return;
    }
  }
  if (supportsDescriptors$2) {
    defineDataProperty2(object, name, value, true);
  } else {
    defineDataProperty2(object, name, value);
  }
};
var defineProperties = function(object, map) {
  var predicates = arguments.length > 2 ? arguments[2] : {};
  var props = keys2(map);
  if (hasSymbols2) {
    props = concat.call(props, Object.getOwnPropertySymbols(map));
  }
  for (var i = 0; i < props.length; i += 1) {
    defineProperty$1(object, props[i], map[props[i]], predicates[props[i]]);
  }
};
defineProperties.supportsDescriptors = !!supportsDescriptors$2;
var defineProperties_1 = defineProperties;
var callBind$2 = { exports: {} };
var GetIntrinsic2 = getIntrinsic;
var define$4 = defineDataProperty$1;
var hasDescriptors$1 = hasPropertyDescriptors_1();
var gOPD$3 = gopd$1;
var $TypeError$3 = type;
var $floor = GetIntrinsic2("%Math.floor%");
var setFunctionLength = function setFunctionLength2(fn2, length) {
  if (typeof fn2 !== "function") {
    throw new $TypeError$3("`fn` is not a function");
  }
  if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor(length) !== length) {
    throw new $TypeError$3("`length` must be a positive 32-bit integer");
  }
  var loose = arguments.length > 2 && !!arguments[2];
  var functionLengthIsConfigurable = true;
  var functionLengthIsWritable = true;
  if ("length" in fn2 && gOPD$3) {
    var desc2 = gOPD$3(fn2, "length");
    if (desc2 && !desc2.configurable) {
      functionLengthIsConfigurable = false;
    }
    if (desc2 && !desc2.writable) {
      functionLengthIsWritable = false;
    }
  }
  if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
    if (hasDescriptors$1) {
      define$4(
        /** @type {Parameters<define>[0]} */
        fn2,
        "length",
        length,
        true,
        true
      );
    } else {
      define$4(
        /** @type {Parameters<define>[0]} */
        fn2,
        "length",
        length
      );
    }
  }
  return fn2;
};
var bind2 = functionBind;
var $apply = functionApply;
var actualApply = actualApply$1;
var applyBind = function applyBind2() {
  return actualApply(bind2, $apply, arguments);
};
(function(module) {
  var setFunctionLength$1 = setFunctionLength;
  var $defineProperty2 = esDefineProperty;
  var callBindBasic3 = callBindApplyHelpers;
  var applyBind$1 = applyBind;
  module.exports = function callBind2(originalFunction) {
    var func = callBindBasic3(arguments);
    var adjustedLength = originalFunction.length - (arguments.length - 1);
    return setFunctionLength$1(
      func,
      1 + (adjustedLength > 0 ? adjustedLength : 0),
      true
    );
  };
  if ($defineProperty2) {
    $defineProperty2(module.exports, "apply", { value: applyBind$1 });
  } else {
    module.exports.apply = applyBind$1;
  }
})(callBind$2);
var callBindExports = callBind$2.exports;
var numberIsNaN = function(value) {
  return value !== value;
};
var implementation$5 = function is(a, b) {
  if (a === 0 && b === 0) {
    return 1 / a === 1 / b;
  }
  if (a === b) {
    return true;
  }
  if (numberIsNaN(a) && numberIsNaN(b)) {
    return true;
  }
  return false;
};
var implementation$4 = implementation$5;
var polyfill$2 = function getPolyfill() {
  return typeof Object.is === "function" ? Object.is : implementation$4;
};
var getPolyfill$3 = polyfill$2;
var define$3 = defineProperties_1;
var shim$3 = function shimObjectIs() {
  var polyfill2 = getPolyfill$3();
  define$3(Object, { is: polyfill2 }, {
    is: function testObjectIs() {
      return Object.is !== polyfill2;
    }
  });
  return polyfill2;
};
var define$2 = defineProperties_1;
var callBind$1 = callBindExports;
var implementation$3 = implementation$5;
var getPolyfill$2 = polyfill$2;
var shim$2 = shim$3;
var polyfill$1 = callBind$1(getPolyfill$2(), Object);
define$2(polyfill$1, {
  getPolyfill: getPolyfill$2,
  implementation: implementation$3,
  shim: shim$2
});
var objectIs = polyfill$1;
var callBound$1 = callBound$3;
var hasToStringTag$1 = shams();
var hasOwn = hasown;
var gOPD$2 = gopd$1;
var fn;
if (hasToStringTag$1) {
  var $exec = callBound$1("RegExp.prototype.exec");
  var isRegexMarker = {};
  var throwRegexMarker = function() {
    throw isRegexMarker;
  };
  var badStringifier = {
    toString: throwRegexMarker,
    valueOf: throwRegexMarker
  };
  if (typeof Symbol.toPrimitive === "symbol") {
    badStringifier[Symbol.toPrimitive] = throwRegexMarker;
  }
  fn = function isRegex2(value) {
    if (!value || typeof value !== "object") {
      return false;
    }
    var descriptor = (
      /** @type {NonNullable<typeof gOPD>} */
      gOPD$2(
        /** @type {{ lastIndex?: unknown }} */
        value,
        "lastIndex"
      )
    );
    var hasLastIndexDataProperty = descriptor && hasOwn(descriptor, "value");
    if (!hasLastIndexDataProperty) {
      return false;
    }
    try {
      $exec(
        value,
        /** @type {string} */
        /** @type {unknown} */
        badStringifier
      );
    } catch (e) {
      return e === isRegexMarker;
    }
  };
} else {
  var $toString = callBound$1("Object.prototype.toString");
  var regexClass = "[object RegExp]";
  fn = function isRegex2(value) {
    if (!value || typeof value !== "object" && typeof value !== "function") {
      return false;
    }
    return $toString(value) === regexClass;
  };
}
var isRegex$1 = fn;
var functionsHaveNames = function functionsHaveNames2() {
  return typeof (function f() {
  }).name === "string";
};
var gOPD$1 = Object.getOwnPropertyDescriptor;
if (gOPD$1) {
  try {
    gOPD$1([], "length");
  } catch (e) {
    gOPD$1 = null;
  }
}
functionsHaveNames.functionsHaveConfigurableNames = function functionsHaveConfigurableNames() {
  if (!functionsHaveNames() || !gOPD$1) {
    return false;
  }
  var desc2 = gOPD$1(function() {
  }, "name");
  return !!desc2 && !!desc2.configurable;
};
var $bind = Function.prototype.bind;
functionsHaveNames.boundFunctionsHaveNames = function boundFunctionsHaveNames() {
  return functionsHaveNames() && typeof $bind === "function" && (function f() {
  }).bind().name !== "";
};
var functionsHaveNames_1 = functionsHaveNames;
var define$1 = defineDataProperty$1;
var hasDescriptors = hasPropertyDescriptors_1();
var functionsHaveConfigurableNames2 = functionsHaveNames_1.functionsHaveConfigurableNames();
var $TypeError$2 = type;
var setFunctionName$1 = function setFunctionName(fn2, name) {
  if (typeof fn2 !== "function") {
    throw new $TypeError$2("`fn` is not a function");
  }
  var loose = arguments.length > 2 && !!arguments[2];
  if (!loose || functionsHaveConfigurableNames2) {
    if (hasDescriptors) {
      define$1(
        /** @type {Parameters<define>[0]} */
        fn2,
        "name",
        name,
        true,
        true
      );
    } else {
      define$1(
        /** @type {Parameters<define>[0]} */
        fn2,
        "name",
        name
      );
    }
  }
  return fn2;
};
var setFunctionName2 = setFunctionName$1;
var $TypeError$1 = type;
var $Object = Object;
var implementation$2 = setFunctionName2(function flags() {
  if (this == null || this !== $Object(this)) {
    throw new $TypeError$1("RegExp.prototype.flags getter called on non-object");
  }
  var result = "";
  if (this.hasIndices) {
    result += "d";
  }
  if (this.global) {
    result += "g";
  }
  if (this.ignoreCase) {
    result += "i";
  }
  if (this.multiline) {
    result += "m";
  }
  if (this.dotAll) {
    result += "s";
  }
  if (this.unicode) {
    result += "u";
  }
  if (this.unicodeSets) {
    result += "v";
  }
  if (this.sticky) {
    result += "y";
  }
  return result;
}, "get flags", true);
var implementation$1 = implementation$2;
var supportsDescriptors$1 = defineProperties_1.supportsDescriptors;
var $gOPD = Object.getOwnPropertyDescriptor;
var polyfill = function getPolyfill2() {
  if (supportsDescriptors$1 && /a/mig.flags === "gim") {
    var descriptor = $gOPD(RegExp.prototype, "flags");
    if (descriptor && typeof descriptor.get === "function" && "dotAll" in RegExp.prototype && "hasIndices" in RegExp.prototype) {
      var calls = "";
      var o = {};
      Object.defineProperty(o, "hasIndices", {
        get: function() {
          calls += "d";
        }
      });
      Object.defineProperty(o, "sticky", {
        get: function() {
          calls += "y";
        }
      });
      descriptor.get.call(o);
      if (calls === "dy") {
        return descriptor.get;
      }
    }
  }
  return implementation$1;
};
var supportsDescriptors = defineProperties_1.supportsDescriptors;
var getPolyfill$1 = polyfill;
var gOPD = gopd$1;
var defineProperty = Object.defineProperty;
var $TypeError = esErrors;
var getProto4 = getProto$2;
var regex = /a/;
var shim$1 = function shimFlags() {
  if (!supportsDescriptors || !getProto4) {
    throw new $TypeError("RegExp.prototype.flags requires a true ES5 environment that supports property descriptors");
  }
  var polyfill2 = getPolyfill$1();
  var proto = getProto4(regex);
  var descriptor = gOPD(proto, "flags");
  if (!descriptor || descriptor.get !== polyfill2) {
    defineProperty(proto, "flags", {
      configurable: true,
      enumerable: false,
      get: polyfill2
    });
  }
  return polyfill2;
};
var define = defineProperties_1;
var callBind = callBindExports;
var implementation = implementation$2;
var getPolyfill3 = polyfill;
var shim = shim$1;
var flagsBound = callBind(getPolyfill3());
define(flagsBound, {
  getPolyfill: getPolyfill3,
  implementation,
  shim
});
var regexp_prototype_flags = flagsBound;
var callBound = callBound$3;
var getDay = callBound("Date.prototype.getDay");
var tryDateObject = function tryDateGetDayCall(value) {
  try {
    getDay(value);
    return true;
  } catch (e) {
    return false;
  }
};
var toStr = callBound("Object.prototype.toString");
var dateClass = "[object Date]";
var hasToStringTag = shams();
var isDateObject = function isDateObject2(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return hasToStringTag ? tryDateObject(value) : toStr(value) === dateClass;
};
var objectKeys = objectKeys$1;
var isArguments4 = isArguments$1;
var is2 = objectIs;
var isRegex = isRegex$1;
var flags2 = regexp_prototype_flags;
var isDate = isDateObject;
var getTime = Date.prototype.getTime;
function deepEqual$1(actual, expected, options) {
  var opts = options || {};
  if (opts.strict ? is2(actual, expected) : actual === expected) {
    return true;
  }
  if (!actual || !expected || typeof actual !== "object" && typeof expected !== "object") {
    return opts.strict ? is2(actual, expected) : actual == expected;
  }
  return objEquiv(actual, expected, opts);
}
function isUndefinedOrNull(value) {
  return value === null || value === void 0;
}
function isBuffer(x) {
  if (!x || typeof x !== "object" || typeof x.length !== "number") {
    return false;
  }
  if (typeof x.copy !== "function" || typeof x.slice !== "function") {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== "number") {
    return false;
  }
  return true;
}
function objEquiv(a, b, opts) {
  var i, key;
  if (typeof a !== typeof b) {
    return false;
  }
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
    return false;
  }
  if (a.prototype !== b.prototype) {
    return false;
  }
  if (isArguments4(a) !== isArguments4(b)) {
    return false;
  }
  var aIsRegex = isRegex(a);
  var bIsRegex = isRegex(b);
  if (aIsRegex !== bIsRegex) {
    return false;
  }
  if (aIsRegex || bIsRegex) {
    return a.source === b.source && flags2(a) === flags2(b);
  }
  if (isDate(a) && isDate(b)) {
    return getTime.call(a) === getTime.call(b);
  }
  var aIsBuffer = isBuffer(a);
  var bIsBuffer = isBuffer(b);
  if (aIsBuffer !== bIsBuffer) {
    return false;
  }
  if (aIsBuffer || bIsBuffer) {
    if (a.length !== b.length) {
      return false;
    }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  try {
    var ka = objectKeys(a);
    var kb = objectKeys(b);
  } catch (e) {
    return false;
  }
  if (ka.length !== kb.length) {
    return false;
  }
  ka.sort();
  kb.sort();
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i]) {
      return false;
    }
  }
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual$1(a[key], b[key], opts)) {
      return false;
    }
  }
  return true;
}
var deepEqual_1 = deepEqual$1;
var multicastdns = multicastDns;
var dnsEqual$1 = dnsEqual$3;
var flatten = arrayFlattenExports;
var deepEqual = deepEqual_1;
var mdnsServer = Server$1;
function Server$1(opts) {
  this.mdns = multicastdns(opts);
  this.mdns.setMaxListeners(0);
  this.registry = {};
  this.mdns.on("query", this._respondToQuery.bind(this));
}
Server$1.prototype.register = function(records) {
  var self = this;
  if (Array.isArray(records)) records.forEach(register);
  else register(records);
  function register(record) {
    var subRegistry = self.registry[record.type];
    if (!subRegistry) subRegistry = self.registry[record.type] = [];
    else if (subRegistry.some(isDuplicateRecord(record))) return;
    subRegistry.push(record);
  }
};
Server$1.prototype.unregister = function(records) {
  var self = this;
  if (Array.isArray(records)) records.forEach(unregister);
  else unregister(records);
  function unregister(record) {
    var type2 = record.type;
    if (!(type2 in self.registry)) return;
    self.registry[type2] = self.registry[type2].filter(function(r2) {
      return r2.name !== record.name;
    });
  }
};
Server$1.prototype._respondToQuery = function(query) {
  var self = this;
  query.questions.forEach(function(question) {
    var type2 = question.type;
    var name = question.name;
    var answers = type2 === "ANY" ? flatten.depth(Object.keys(self.registry).map(self._recordsFor.bind(self, name)), 1) : self._recordsFor(name, type2);
    if (answers.length === 0) return;
    var additionals = [];
    if (type2 !== "ANY") {
      answers.forEach(function(answer) {
        if (answer.type !== "PTR") return;
        additionals = additionals.concat(self._recordsFor(answer.data, "SRV")).concat(self._recordsFor(answer.data, "TXT"));
      });
      additionals.filter(function(record) {
        return record.type === "SRV";
      }).map(function(record) {
        return record.data.target;
      }).filter(unique()).forEach(function(target) {
        additionals = additionals.concat(self._recordsFor(target, "A")).concat(self._recordsFor(target, "AAAA"));
      });
    }
    self.mdns.respond({ answers, additionals }, function(err) {
      if (err) throw err;
    });
  });
};
Server$1.prototype._recordsFor = function(name, type2) {
  if (!(type2 in this.registry)) return [];
  return this.registry[type2].filter(function(record) {
    var _name = ~name.indexOf(".") ? record.name : record.name.split(".")[0];
    return dnsEqual$1(_name, name);
  });
};
function isDuplicateRecord(a) {
  return function(b) {
    return a.type === b.type && a.name === b.name && deepEqual(a.data, b.data);
  };
}
function unique() {
  var set = [];
  return function(obj) {
    if (~set.indexOf(obj)) return false;
    set.push(obj);
    return true;
  };
}
var util = require$$1;
var EventEmitter = require$$2.EventEmitter;
var serviceName = multicastDnsServiceTypes;
var dnsEqual = dnsEqual$3;
var dnsTxt = dnsTxt$1;
var TLD = ".local";
var WILDCARD = "_services._dns-sd._udp" + TLD;
var browser = Browser$1;
util.inherits(Browser$1, EventEmitter);
function Browser$1(mdns, opts, onup) {
  if (typeof opts === "function") return new Browser$1(mdns, null, opts);
  EventEmitter.call(this);
  this._mdns = mdns;
  this._onresponse = null;
  this._serviceMap = {};
  this._txt = dnsTxt(opts.txt);
  if (!opts || !opts.type) {
    this._name = WILDCARD;
    this._wildcard = true;
  } else {
    this._name = serviceName.stringify(opts.type, opts.protocol || "tcp") + TLD;
    if (opts.name) this._name = opts.name + "." + this._name;
    this._wildcard = false;
  }
  this.services = [];
  if (onup) this.on("up", onup);
  this.start();
}
Browser$1.prototype.start = function() {
  if (this._onresponse) return;
  var self = this;
  var nameMap = {};
  if (!this._wildcard) nameMap[this._name] = true;
  this._onresponse = function(packet2, rinfo) {
    if (self._wildcard) {
      packet2.answers.forEach(function(answer) {
        if (answer.type !== "PTR" || answer.name !== self._name || answer.name in nameMap) return;
        nameMap[answer.data] = true;
        self._mdns.query(answer.data, "PTR");
      });
    }
    Object.keys(nameMap).forEach(function(name) {
      goodbyes(name, packet2).forEach(self._removeService.bind(self));
      var matches = buildServicesFor(name, packet2, self._txt, rinfo);
      if (matches.length === 0) return;
      matches.forEach(function(service2) {
        if (self._serviceMap[service2.fqdn]) return;
        self._addService(service2);
      });
    });
  };
  this._mdns.on("response", this._onresponse);
  this.update();
};
Browser$1.prototype.stop = function() {
  if (!this._onresponse) return;
  this._mdns.removeListener("response", this._onresponse);
  this._onresponse = null;
};
Browser$1.prototype.update = function() {
  this._mdns.query(this._name, "PTR");
};
Browser$1.prototype._addService = function(service2) {
  this.services.push(service2);
  this._serviceMap[service2.fqdn] = true;
  this.emit("up", service2);
};
Browser$1.prototype._removeService = function(fqdn) {
  var service2, index;
  this.services.some(function(s, i) {
    if (dnsEqual(s.fqdn, fqdn)) {
      service2 = s;
      index = i;
      return true;
    }
  });
  if (!service2) return;
  this.services.splice(index, 1);
  delete this._serviceMap[fqdn];
  this.emit("down", service2);
};
function goodbyes(name, packet2) {
  return packet2.answers.concat(packet2.additionals).filter(function(rr) {
    return rr.type === "PTR" && rr.ttl === 0 && dnsEqual(rr.name, name);
  }).map(function(rr) {
    return rr.data;
  });
}
function buildServicesFor(name, packet2, txt2, referer) {
  var records = packet2.answers.concat(packet2.additionals).filter(function(rr) {
    return rr.ttl > 0;
  });
  return records.filter(function(rr) {
    return rr.type === "PTR" && dnsEqual(rr.name, name);
  }).map(function(ptr) {
    var service2 = {
      addresses: []
    };
    records.filter(function(rr) {
      return (rr.type === "SRV" || rr.type === "TXT") && dnsEqual(rr.name, ptr.data);
    }).forEach(function(rr) {
      if (rr.type === "SRV") {
        var parts = rr.name.split(".");
        var name2 = parts[0];
        var types2 = serviceName.parse(parts.slice(1, -1).join("."));
        service2.name = name2;
        service2.fqdn = rr.name;
        service2.host = rr.data.target;
        service2.referer = referer;
        service2.port = rr.data.port;
        service2.type = types2.name;
        service2.protocol = types2.protocol;
        service2.subtypes = types2.subtypes;
      } else if (rr.type === "TXT") {
        service2.rawTxt = rr.data;
        service2.txt = txt2.decode(rr.data);
      }
    });
    if (!service2.name) return;
    records.filter(function(rr) {
      return (rr.type === "A" || rr.type === "AAAA") && dnsEqual(rr.name, service2.host);
    }).forEach(function(rr) {
      service2.addresses.push(rr.data);
    });
    return service2;
  }).filter(function(rr) {
    return !!rr;
  });
}
var Registry = registry;
var Server = mdnsServer;
var Browser = browser;
var bonjour = Bonjour;
function Bonjour(opts) {
  if (!(this instanceof Bonjour)) return new Bonjour(opts);
  this._server = new Server(opts);
  this._registry = new Registry(this._server);
}
Bonjour.prototype.publish = function(opts) {
  return this._registry.publish(opts);
};
Bonjour.prototype.unpublishAll = function(cb) {
  this._registry.unpublishAll(cb);
};
Bonjour.prototype.find = function(opts, onup) {
  return new Browser(this._server.mdns, opts, onup);
};
Bonjour.prototype.findOne = function(opts, cb) {
  var browser2 = new Browser(this._server.mdns, opts);
  browser2.once("up", function(service2) {
    browser2.stop();
    if (cb) cb(service2);
  });
  return browser2;
};
Bonjour.prototype.destroy = function() {
  this._registry.destroy();
  this._server.mdns.destroy();
};
const bonjour$1 = /* @__PURE__ */ getDefaultExportFromCjs(bonjour);
const app = new Hono();
app.use("*", cors());
app.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  if (!file)
    return c.text("No file uploaded", 400);
  const buffer = await file.arrayBuffer();
  const uploadsDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, file.name);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return c.text("File received!");
});
bonjour$1().publish({
  name: "updrop-local-server",
  type: "http",
  port: 7e3,
  // you can add txt if you want metadata
  txt: {
    description: "Updrop file sharing server"
  }
});
const startLocalServer = (port = 7656) => {
  serve({ fetch: app.fetch, port }, () => {
    console.log(`🚀 Hono server running on http://localhost:${port}`);
    console.log(`📡 Bonjour service announced`);
  });
};
startLocalServer();
createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app$1.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app$1.quit();
    win = null;
  }
});
app$1.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app$1.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};

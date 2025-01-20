"use strict";
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = function(to, from, except, desc) {
    if (from && (typeof from === "undefined" ? "undefined" : _type_of(from)) === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toESM = function(mod, isNodeMode, target) {
    return target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(// If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
        value: mod,
        enumerable: true
    }) : target, mod);
};
// src/data/rates/yearData.ts
function generateYearTemplate(year) {
    var baseRate = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 145;
    var months = Array.from({
        length: 12
    }, function(_, i) {
        return i + 1;
    });
    var yearTemplate = {};
    months.forEach(function(month) {
        var monthKey = "".concat(year, "-").concat(String(month).padStart(2, "0"));
        var daysInMonth = new Date(year, month, 0).getDate();
        var monthData = {};
        for(var day = 1; day <= daysInMonth; day++){
            var dateKey = "".concat(monthKey, "-").concat(String(day).padStart(2, "0"));
            monthData[dateKey] = baseRate;
        }
        yearTemplate[monthKey] = monthData;
    });
    return yearTemplate;
}
// scripts/generateHistoricalRates.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var START_YEAR = 2020;
var END_YEAR = 2024;
var BASE_RATES = {
    2020: 108,
    2021: 115,
    2022: 125,
    2023: 135,
    2024: 145
};
function generateRateFiles() {
    return _generateRateFiles.apply(this, arguments);
}
function _generateRateFiles() {
    _generateRateFiles = _async_to_generator(function() {
        var year, monthKey, yearData, filePath, fileContent, indexPath, indexContent;
        return _ts_generator(this, function(_state) {
            for(year = START_YEAR; year <= END_YEAR; year++){
                monthKey = "".concat(year);
                yearData = generateYearTemplate(year, BASE_RATES[monthKey]);
                filePath = import_path.default.join(__dirname, "../src/data/rates/".concat(year, ".ts"));
                fileContent = "// src/data/rates/".concat(year, ".ts\nimport type { YearlyRates } from './yearData';\n\nexport const rates").concat(year, ": YearlyRates = ").concat(JSON.stringify(yearData, null, 2), ";\n");
                import_fs.default.writeFileSync(filePath, fileContent);
                console.log("Generated rates for ".concat(year));
            }
            indexPath = import_path.default.join(__dirname, "../src/data/rates/index.ts");
            indexContent = "// src/data/rates/index.ts\n".concat(Array.from({
                length: END_YEAR - START_YEAR + 1
            }, function(_, i) {
                return START_YEAR + i;
            }).map(function(year) {
                return "import { rates".concat(year, " } from './").concat(year, "';");
            }).join("\n"), "\n\nexport { ").concat(Array.from({
                length: END_YEAR - START_YEAR + 1
            }, function(_, i) {
                return "rates".concat(START_YEAR + i);
            }).join(", "), " };\n");
            import_fs.default.writeFileSync(indexPath, indexContent);
            console.log("Generated index.ts");
            return [
                2
            ];
        });
    });
    return _generateRateFiles.apply(this, arguments);
}
generateRateFiles();

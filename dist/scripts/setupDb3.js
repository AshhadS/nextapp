"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_1 = require("@supabase/supabase-js");
var fs = require("fs");
var path = require("path");
// Read environment variables from .env.local
var envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
var envVars = Object.fromEntries(envFile.split('\n')
    .filter(function (line) { return line && !line.startsWith('#'); })
    .map(function (line) { return line.split('='); }));
var supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
var supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables');
    process.exit(1);
}
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function setupDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var sqlFiles, _i, sqlFiles_1, filename, filePath, sql, statements, _a, statements_1, stmt, error, profilesError, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    sqlFiles = ['direct-messages.sql', 'fix-messages-schema.sql', 'typing-status.sql'];
                    _i = 0, sqlFiles_1 = sqlFiles;
                    _b.label = 1;
                case 1:
                    if (!(_i < sqlFiles_1.length)) return [3 /*break*/, 6];
                    filename = sqlFiles_1[_i];
                    filePath = path.join(process.cwd(), filename);
                    if (!fs.existsSync(filePath)) return [3 /*break*/, 5];
                    console.log("\nExecuting ".concat(filename, "..."));
                    sql = fs.readFileSync(filePath, 'utf8');
                    statements = sql
                        .split(';')
                        .map(function (stmt) { return stmt.trim(); })
                        .filter(function (stmt) { return stmt.length > 0; });
                    _a = 0, statements_1 = statements;
                    _b.label = 2;
                case 2:
                    if (!(_a < statements_1.length)) return [3 /*break*/, 5];
                    stmt = statements_1[_a];
                    return [4 /*yield*/, supabase.rpc('execute_sql', { sql: stmt })];
                case 3:
                    error = (_b.sent()).error;
                    if (error) {
                        console.error("Error executing statement from ".concat(filename, ":"), error);
                        console.error('Statement:', stmt);
                    }
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log('\nVerifying database setup...');
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('count(*)')
                            .single()];
                case 7:
                    profilesError = (_b.sent()).error;
                    if (profilesError) {
                        console.error('Error verifying profiles table:', profilesError);
                    }
                    else {
                        console.log('✓ Profiles table is set up correctly');
                    }
                    console.log('\nDatabase setup completed');
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _b.sent();
                    console.error('Setup failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
setupDatabase();

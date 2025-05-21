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
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables');
    process.exit(1);
}
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function setupDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, users, usersError, _b, existingProfiles, profilesError, existingProfileIds_1, usersWithoutProfiles, profilesToCreate, insertError, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    // Create profiles table if it doesn't exist
                    console.log('Setting up profiles table...');
                    return [4 /*yield*/, supabase.from('profiles').select('id').limit(1).single()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, supabase.auth.admin.listUsers()];
                case 2:
                    _a = _c.sent(), users = _a.data.users, usersError = _a.error;
                    if (usersError) {
                        console.error('Error fetching users:', usersError);
                        return [2 /*return*/];
                    }
                    if (!users || users.length === 0) {
                        console.log('No users found');
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat(users.length, " users"));
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .select('id')];
                case 3:
                    _b = _c.sent(), existingProfiles = _b.data, profilesError = _b.error;
                    if (profilesError) {
                        console.error('Error fetching profiles:', profilesError);
                        return [2 /*return*/];
                    }
                    existingProfileIds_1 = new Set((existingProfiles === null || existingProfiles === void 0 ? void 0 : existingProfiles.map(function (p) { return p.id; })) || []);
                    usersWithoutProfiles = users.filter(function (user) { return !existingProfileIds_1.has(user.id); });
                    if (!(usersWithoutProfiles.length > 0)) return [3 /*break*/, 5];
                    console.log("Creating profiles for ".concat(usersWithoutProfiles.length, " users..."));
                    profilesToCreate = usersWithoutProfiles.map(function (user) {
                        var _a;
                        return ({
                            id: user.id,
                            username: ((_a = user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || "user_".concat(user.id.substring(0, 8)),
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });
                    });
                    return [4 /*yield*/, supabase
                            .from('profiles')
                            .insert(profilesToCreate)];
                case 4:
                    insertError = (_c.sent()).error;
                    if (insertError) {
                        console.error('Error creating profiles:', insertError);
                        return [2 /*return*/];
                    }
                    console.log('Created missing profiles successfully');
                    return [3 /*break*/, 6];
                case 5:
                    console.log('All users have profiles');
                    _c.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _c.sent();
                    console.error('Setup failed:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
setupDatabase();

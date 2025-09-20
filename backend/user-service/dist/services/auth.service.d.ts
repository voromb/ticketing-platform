import { IUser } from '../models/user.model';
declare class AuthService {
    private readonly JWT_SECRET;
    private readonly GOOGLE_CLIENT_ID;
    private googleClient;
    constructor();
    login(email: string, password: string): Promise<{
        success: boolean;
        token: string;
        user: {
            id: unknown;
            username: string;
            email: string;
            role: "user" | "company" | "admin";
            avatar: string | undefined;
        };
    }>;
    register(userData: any): Promise<{
        success: boolean;
        token: string;
        user: {
            id: unknown;
            username: string;
            email: string;
            role: "user" | "company" | "admin";
        };
    }>;
    getUserById(userId: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    updateProfile(userId: string, profileData: any): Promise<{
        success: boolean;
        user: (import("mongoose").Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | null;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    googleLogin(token: string): Promise<{
        success: boolean;
        token: string;
        user: {
            id: unknown;
            username: string;
            email: string;
            role: "user" | "company" | "admin";
            avatar: string | undefined;
            firstName: string | undefined;
            lastName: string | undefined;
        };
    }>;
    private generateToken;
    verifyToken(token: string): any;
}
export default AuthService;
//# sourceMappingURL=auth.service.d.ts.map
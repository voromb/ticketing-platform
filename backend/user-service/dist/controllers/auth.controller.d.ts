import { Request, Response } from 'express';
declare class AuthController {
    private authService;
    constructor();
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    register: (req: Request, res: Response) => Promise<void>;
    getProfile: (req: any, res: Response) => Promise<void>;
    updateProfile: (req: any, res: Response) => Promise<void>;
    changePassword: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    googleLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
export default AuthController;
//# sourceMappingURL=auth.controller.d.ts.map
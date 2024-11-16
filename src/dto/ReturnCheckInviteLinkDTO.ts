import { GetInviteLinkDTO } from "./GetInviteLinkDTO";

export class ReturnCheckInviteLinkDTO {
    success: boolean;
    userData: GetInviteLinkDTO | null;
    message: string | null;


    constructor(success: boolean, userData: GetInviteLinkDTO | null, message: string | null) {
        this.success = success;
        this.userData = userData;
        this.message = message;
    }
}
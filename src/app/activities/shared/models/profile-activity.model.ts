export class Profile {
  CountryISOCode: string;
  FirstName: string;
  LastName: string;
  ProfileImageUrl: string;
  ProfileImageSmallUrl: string;
  isProfileImageAvailable = false; // For local use
  constructor(user?: any, isGroup?: boolean) {
    if (!user) {
      return;
    }
    this.FirstName = user.FirstName;
    this.LastName = user.LastName;
    this.CountryISOCode = user.CountryISOCode;
    if (!user.ProfileImageUrl || user.ProfileImageUrl === '') {
      if (!isGroup) {
        this.ProfileImageUrl = './assets/images/member_default_avatar.png';
        this.ProfileImageSmallUrl = './assets/images/member_default_avatar.png';
      } else {
        this.ProfileImageUrl = './assets/images/group_img_default.png';
        this.ProfileImageSmallUrl = './assets/images/group_img_default_small.png';
      }
    } else {
      this.isProfileImageAvailable = true;
      this.ProfileImageUrl = user.ProfileImageUrl;
      this.ProfileImageSmallUrl = user.ProfileImageUrl.replace('profileimages', 'profileimages-small');
    }
  }
}

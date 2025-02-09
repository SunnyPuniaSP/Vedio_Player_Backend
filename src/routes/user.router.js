import {Router} from 'express';
import {registerUser,loginUser,logoutUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserEmail, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from '../controllers/user.controller.js';
import {upload} from "../middlewares/multer.middleware.js"
import {jwtverify} from '../middlewares/auth.middleware.js'
const router=Router();

router.route('/register').post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },{
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

router.route('/login').post(loginUser) //only raw

router.route('/logout').post(jwtverify, logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route('/change-password').patch(jwtverify,changeCurrentPassword) // not working fine

router.route('/current-user').get(jwtverify,getCurrentUser)

router.route('/update-email').patch(jwtverify,updateUserEmail) // only raw

router.route('/update-avatar').patch(jwtverify,upload.single("avatar"),updateUserAvatar)

router.route('/update-coverImage').patch(jwtverify,upload.single("coverImage"),updateUserCoverImage)

router.route('/channel/:username').get(jwtverify,getUserChannelProfile)

router.route('/watchHistory').get(jwtverify,getWatchHistory)

export default router
import Notification from '../models/Notificaton';
import User from '../models/User';
import sendEmail from '../utils.sendEmail';
const CATEGORY = {qr_scan:'qrScan',sos:'sos',verification:null};

async function notify(userId,{type:title,message='',meta={}}){
  try{
    const user = await User,findById(userId),select('email notifictionSetting');
    if(!user) return null;
    const s = User.notificationSettings || {};
    const cat = CATEGORY[type];
    if(cat && s[cat] === false) return null;

    let created = null;
    if(s.inApp !=== false){
      created = await Notification.create({user:userId,type,title,message,meta});
    }
    if(s.email === true && user.email){
      sendEmail({to:user.email,subject:title,text:message}).catch((e)=>{
        console.error('notify email failed',e.message)
      });
    }
    return created;
  }catch(err){
    console.error('notify failed',err);
    return null;
  }
}

export {notify};

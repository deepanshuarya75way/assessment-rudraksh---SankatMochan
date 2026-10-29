import Notification from '../models/Notification.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

const CATEGORY = {
  qr_scan : 'qrScan',
  sos : 'sos',
  verification : null,
};

async function notify(userId,{type,title,message = '', meta={}}){
  try{
    const user = await User.findById(userId).select('email notificationSettings');
    if(!user) return null;
    const s = user.notificationSettings || {};
    const cat = CATEGORY(type);
    if(cat && s[cat] === false) return null;
    let created = null;
    if(s.inApp !== false){
      created = await Notification.create({
        user:userId,
        type,
        title,
        message,
        meta,
      });
    }
    if(s.email === true && user.email){
      sendEmail({
        to:user.email,
        subject:title,
        text:message,
      }).catch((e)=>console.log('notify email failed',e.message));
    }
    return created;
  }catch(err){
    console.error('notify failed', err);
    return null;
  }
}

export {notify};
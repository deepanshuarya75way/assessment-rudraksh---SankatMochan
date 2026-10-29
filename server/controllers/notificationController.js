import Notification from "../models/Notification.js";

export const list = async(req,res)=>{
  const {items,unreadCount} = await Promise.all([
    Notification.find({user:req.user._id}).sort({createdAt:-1}).limit(50),
    Notification.countDocuments({
      user:req.user._id,
      read:false,
    }),
  ])
  res.json({items,unreadCount})
};

export const markRead = async(req,res)=>{
  const n = await Notification.findOneAndUpdate(
    {_id: req.params.id, user: req.user._id},
    {read : true},
    {new : true}
  );
  if(!n){
    return res.status(404).json({message:'Not found'});
  }
  res.json(n);
};

export const markAllRead = async(req,res)=>{
  await Notification.updateMany(
    {user : req.user._id, read:false},
    {read:true}
  );
  res.json({ok : true});
}



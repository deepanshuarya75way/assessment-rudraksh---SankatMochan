import {useEffect,useRef,useState,useCallback} from 'react';
import api from '/src/api/axios';
import {Bell} from 'lucide-react';
const BellIcon = ()=>{
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ari-hidden="true">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3"/>
    <path d ="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
}

export default function NotificationBell(){
  const [items,setItems] = useState([]);
  const [unread,setUnread] = useState(0);
  const [open,setOpen] = useState(false);
  const ref = useRef(null);
  
  const load = useCallback(async()=>{
    try{
      const {data} = await api.get('/notifications');
      setItems(data.items || []);
      setUnread(data.unreadCount || 0);
    }catch(e){}
  },[]);

  useEffect(()=>{
    load();
    const t = setInterval(load,5000);
    const onVisible = ()=> document.visibilityState == 'visible' && load();
    document.addEventListener('visibilitychange',onVisible);
    return ()=>{
      clearInterval(t);
      document.removeEventListener('visibilitychange',onVisible);
    };
  },[load]);

  useEffect(()=>{
    const close = (e)=> ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown',close);
    return ()=> document.removeEventListener('mousedown',close);
  },[]);

  const markOne = async(n)=>{
    if(n.read) return;
    setItems((p)= p.map((x)=>(x._id === n._id ? {...x,read:true}:x)));
    setUnread((u)=>Math.max(0,u-1));
    await api.patch(`/notifications/${n._id}/read`).catch(load);
  };

  const markAll = async()=>{
    setItems((p)=>p.map((x)=>({...x,read:true})));
    setUnread(0);
    await api.patch(`/notifications/read-all`).catch(load);
  };

  return(
    <div ref={ref} style={{position:'relative'}}>
      <button 
      onClick={()=>setOpen((o)=>!o)}
      aria-label={`Notification${unread ?`,${unread} unread` : ''}`}
      style={{
        position:'relative',
        display :'flex', 
        alignItems:'center',
        justufyContent: 'center',
        padding:10,
        borderRadius:12,
        background : 'rgba(30,41,59,0.9)',
        border: '1px solid #1e293b',
        color:'#f1f5f9',
        cursor:'pointer'
      }}
      >

        <Bell size={18}/>
        {unread > 0 && (
          <span style={{
            position:'absolute', top:0, right:0, minWidth:16, height:16, padding:'0 4px',
            borderRadius :8, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight:700,
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', right:0, top:'120%', width:340, maxWidth:'90vw',
          maxHeight:420, overflowV :'auto', background : '#161a26', color:'#e5e7eb',
          border:'1px solid #2a3042', borderRadius:12,
          boxShadow:'0 8px 30px rgba(0,0,0,0.5)', zIndex:1000,
        }}>
          <div style={{
            display:'flex',justifyContent:'space-between',alignItems:'center',
            padding:'12px 14px', borderBottom:'1px solif #2a3042',
          }}>

            <strong>Notifications</strong>
            <button
            onClick={markAll}
            disabled={!unread}
            style={{
              background:'none', border:0, color:'#60a5fa', fontSize:13,
              cursor:unread ? 'pointer' : 'default', capacity:unread ? 1 : 0.4,
            }}
            >
              Mark All read
            </button>
            </div>

            {(!Array.isArray(items) || items.length) === 0 && (
              <div style={{
                padding:20, color:'#9ca3af',textAlign:'center',
              }}>
                No Notifications yet
              </div>
            )}

            {(Array.isArray(items)? items : []).map((n)=>(
              <div
              key={n?._id}
              onClick={()=>markOne(n)}
              style={{
                padding:'10px 14px', borderBottom:'1px solid #222838', cursor:'pointer',
                background : n?.read ? 'transparent' : rgba(59,130,246,.12),
                borderLeft: n?.read ? '3px solid transparent' : '3px solid #3b82f6',
              }}
              >
                <div style={{fontWeight:n?.read?400 : 600, fontSize:14}}> {String(n?.title ?? '')}</div>

                {n?.message ?  (
                  <div style={{fontSize:12, color:'#9ca3af', marginTop:2}}>{String(n.message)}</div>
                ) : null}

                <div style={{fontSize:11, color:'#6b7280',marginTop:4}}>
                  {n?.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </div>
                </div>
            ))}

        </div>
      )}
    </div>
  );
}
// Role authorization middleware
const roleMiddleware=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return re.status(403).json({
                success:false,
                message:'Access denied.'
            })
        }
        next();
    }
}

m,odule.exports=roleMiddleware;
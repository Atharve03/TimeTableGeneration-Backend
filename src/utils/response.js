export const success = (res, message, data = {}, status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  };
  
  export const fail = (res, message, status = 400, details = null) => {
    return res.status(status).json({
      success: false,
      message,
      details,
    });
  };
  
var dbbconnection = require('./server');
//server1 for offline
var express = require('express');
var app = express();
var bodyparser = require('body-parser');
const jwt = require('jsonwebtoken')
var path = require('path');
const secretkey = "secretkeysvpcet";
const bcrypt = require('bcrypt');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
const uploadFile = require("./uploader");
const readXlsxFile = require('read-excel-file/node');
const { time } = require('console');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');

//Auto Restrict Student Daily
 var CronJob = require('cron').CronJob;
var job = new CronJob('0 0 * * *', function() {

  dbbconnection.getConnection(function (err, connection) {
    var sql1 = "Update studentdetails Set status='Restrict' Where UID IN (SELECT UID FROM log_details1 where passtype='City Pass' and hostelintime is null and outdatetime<CURDATE())";
    connection.query(sql1, function (err, result) {
      if (err) throw err;
      else {

       
      }
    });
    connection.release();
  });
 
  /*
   * Runs every day
   * at 12:00:00 AM.
   */
  }, function () {
    /* This function is executed when the job stops */
  },
  true, /* Start the job right now */
  
  //timeZone /* Time zone of this job. */
  

);

//email configuration
const templatePath = __dirname + '/views/email.ejs';
const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tnps@stvincentngp.edu.in',
    pass: 'Hostelmis123'
  }
});


function currentdate() {
  var currentdate = new Date().toLocaleString("en-US", {
    timeZone:
      "Asia/Kolkata"
  });
  return currentdate;
}

console.log(datetime(currentdate()));

function datetime(str) {
  const dateObject = new Date(str);
  // current date
  // adjust 0 before single digit date
  const date = (`${dateObject.getDate()}`).slice(-2);

  // current month
  const month = (`${dateObject.getMonth() + 1}`).slice(-2);

  // current year
  const year = dateObject.getFullYear();

  // current hours
  const hours = dateObject.getHours();

  // current minutes
  const minutes = dateObject.getMinutes();

  // current seconds
  const seconds = dateObject.getSeconds();

  return (`${year}-${month}-${date}  ${hours}:${minutes}:${seconds}`);
}

function getdate(str) {
  const dateObject = new Date(str);
  // current date
  // adjust 0 before single digit date
  const date = (`${dateObject.getDate()}`).slice(-2);

  return (`${date}`);
}

function getmonth(str) {
  const dateObject = new Date(str);
  // current date
  // current month
  const month = (`${dateObject.getMonth() + 1}`).slice(-2);

  return (`${month}`);
}


function convert(str) {
  var date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join("-");
}

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(session({

  secret: 'tpdc',

  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: (1000 * 60 * 100)
  }

}));
app.use(cookieParser());
app.use(flash());

//View tables
app.set('view engine', 'ejs');


app.get('/', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID" || role == "Gateauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      res.render(__dirname + '/views/homepage', { message: req.flash('message') });
    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //
});

app.get('/homepage', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID" || role == "Gateauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      res.render(__dirname + '/views/homepage', { message: req.flash('message') });
    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //
});

app.get('/Collegepage', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID" || role == "Gateauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      res.render(__dirname + '/views/Collegepage', { message: req.flash('message') });
    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //
});

app.get('/gateouttoday', verifyjwt, function (req, res) {


  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID" || role == "Gateauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      dbbconnection.getConnection(function (err, connection) {
        var sql1 = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and indatetime is null and date(outdatetime) = date('" + datetime(currentdate()) + "') ORDER BY log.logid desc";
        connection.query(sql1, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/gateouttoday', { result: result, message: req.flash('message') });
          }
        });
        connection.release();
      });

    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //
});

//hostel out for hostel authority
app.get('/hostelouttoday', verifyjwt, function (req, res) {


  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    role = decode.role;
    if (role == "SuperID" || role == "Hostelauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      dbbconnection.getConnection(function (err, connection) {
        var sql1 = "select log.logid,stu.uid,stu.sname,stu.mobileno,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and log.hostelintime is null and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql1, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/hostelouttoday', { result: result, message: req.flash('message') });
          }
        });
        connection.release();
      });

    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //
});

app.get('/bound', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    var role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {


        var sql = "select * from timebound where hostel='Boys'";

        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/bound', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {


        var sql = "select * from timebound where hostel='Girls'";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/bound', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "SuperID") {


        var sql = "select * from timebound";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/bound', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }

      connection.release();
    });


  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Login failed');
    return res.redirect('/loginpanel');
  }

});

//reports
app.get('/reports', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      else if (role == "SuperID") {

        var sql = "Select count(*) as totalstudent from studentdetails where category='Hostel' ";
        var sql2 = "SELECT count(*) as insidehostel FROM log_details1 AS log JOIN studentdetails AS stu ON stu.uid = log.uid WHERE log.indatetime IS NOT NULL"
        var sql3 = "select count(*) as gateout from log_details1 as log join studentdetails as stu where stu.uid=log.uid and indatetime is null and outdatetime IS NOT NULL and category='Hostel' ";
        var sql4 = "select count(*) as hostelout from log_details1 as log join studentdetails as stu where stu.uid=log.uid and hostelintime is null and category='Hostel'";
        var sql5 = "select count(*) as citypass from log_details1 where passtype='City Pass' and hostelintime is null"
        var sql6 = "select count(*) as homepass from log_details1 where passtype='Home Pass' and hostelintime is null"
        const result = {};

        connection.query(sql, function (err, totalStudentsResult) {
          if (err) throw err;
          result.totalStudents = totalStudentsResult[0].totalstudent;

          connection.query(sql2, function (err, insideHostelResult) {
            if (err) {
              console.error(err);
              res.status(500).send('Error executing SQL2 query');
              return;
            }

            result.insideHostel = insideHostelResult[0].insidehostel;

            connection.query(sql3, function (err, gateOutResult) {
              if (err) {
                console.error(err);
                res.status(500).send('Error executing SQL3 query');
                return;
              }

              result.gateOut = gateOutResult[0].gateout;

              connection.query(sql4, function (err, hostelOutResult) {
                if (err) {
                  console.error(err);
                  res.status(500).send('Error executing SQL4 query');
                  return;
                }

                result.hostelOut = hostelOutResult[0].hostelout;

                connection.query(sql5, function (err, citypass) {
                  if (err) {
                    console.error(err);
                    res.status(500).send('Error executing SQL5 query');
                    return;
                  }

                  result.citypass = citypass[0].citypass;

                  connection.query(sql6, function (err, homepass) {
                    if (err) {
                      console.error(err);
                      res.status(500).send('Error executing SQL6 query');
                      return;
                    }
                    result.homepass = homepass[0].homepass;
                    // Render the EJS template with the results
                    res.render(__dirname + '/views/reports', { result: result, message: req.flash('message') });
                  })
                });
              });
            });
          });
        });
      }
      else if (role == "BoysHostelAdmin" || role == "Hostelauthority") {
        var sql = "Select count(*) as totalstudent from studentdetails where category='Hostel' and gender='MALE' ";
        var sql2 = "SELECT count(*) as insidehostel FROM log_details1 AS log JOIN studentdetails AS stu ON stu.uid = log.uid WHERE log.indatetime IS NOT NULL and stu.category='Hostel' and stu.gender='MALE'"
        var sql3 = "select count(*) as gateout from log_details1 as log join studentdetails as stu where stu.uid=log.uid and indatetime is null and outdatetime IS NOT NULL and category='Hostel' and stu.gender='MALE'";
        var sql4 = "select count(*) as hostelout from log_details1 as log join studentdetails as stu where stu.uid=log.uid and hostelintime is null and stu.category='Hostel' and stu.gender='MALE'";
        var sql5 = "select count(*) as citypass from log_details1 as log join studentdetails as stu where stu.uid=log.uid and passtype='City Pass' and hostelintime is null and stu.category='Hostel' and stu.gender='MALE'"
        var sql6 = "select count(*) as homepass from log_details1 as log join studentdetails as stu where stu.uid=log.uid and passtype='Home Pass' and hostelintime is null and stu.category='Hostel' and stu.gender='MALE'"
        const result = {};

        connection.query(sql, function (err, totalStudentsResult) {
          if (err) throw err;
          result.totalStudents = totalStudentsResult[0].totalstudent;

          connection.query(sql2, function (err, insideHostelResult) {
            if (err) {
              console.error(err);
              res.status(500).send('Error executing SQL2 query');
              return;
            }

            result.insideHostel = insideHostelResult[0].insidehostel;

            connection.query(sql3, function (err, gateOutResult) {
              if (err) {
                console.error(err);
                res.status(500).send('Error executing SQL3 query');
                return;
              }

              result.gateOut = gateOutResult[0].gateout;

              connection.query(sql4, function (err, hostelOutResult) {
                if (err) {
                  console.error(err);
                  res.status(500).send('Error executing SQL4 query');
                  return;
                }

                result.hostelOut = hostelOutResult[0].hostelout;

                connection.query(sql5, function (err, citypass) {
                  if (err) {
                    console.error(err);
                    res.status(500).send('Error executing SQL5 query');
                    return;
                  }

                  result.citypass = citypass[0].citypass;

                  connection.query(sql6, function (err, homepass) {
                    if (err) {
                      console.error(err);
                      res.status(500).send('Error executing SQL6 query');
                      return;
                    }
                    result.homepass = homepass[0].homepass;
                    // Render the EJS template with the results
                    res.render(__dirname + '/views/reports', { result: result, message: req.flash('message') });
                  })
                });
              });
            });
          });
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var sql = "Select count(*) as totalstudent from studentdetails where category='Hostel' and gender='FEMALE' ";
        var sql2 = "SELECT count(*) as insidehostel FROM log_details1 AS log JOIN studentdetails AS stu ON stu.uid = log.uid WHERE log.indatetime IS NOT NULL and stu.category='Hostel' and stu.gender='FEMALE'"
        var sql3 = "select count(*) as gateout from log_details1 as log join studentdetails as stu where stu.uid=log.uid and indatetime is null and outdatetime IS NOT NULL and category='Hostel' and stu.gender='FEMALE'";
        var sql4 = "select count(*) as hostelout from log_details1 as log join studentdetails as stu where stu.uid=log.uid and hostelintime is null and stu.category='Hostel' and stu.gender='FEMALE'";
        var sql5 = "select count(*) as citypass from log_details1 as log join studentdetails as stu where stu.uid=log.uid and passtype='City Pass' and hostelintime is null and stu.category='Hostel' and stu.gender='FEMALE'"
        var sql6 = "select count(*) as homepass from log_details1 as log join studentdetails as stu where stu.uid=log.uid and passtype='Home Pass' and hostelintime is null and stu.category='Hostel' and stu.gender='FEMALE'"
        const result = {};

        connection.query(sql, function (err, totalStudentsResult) {
          if (err) throw err;
          result.totalStudents = totalStudentsResult[0].totalstudent;

          connection.query(sql2, function (err, insideHostelResult) {
            if (err) {
              console.error(err);
              res.status(500).send('Error executing SQL2 query');
              return;
            }

            result.insideHostel = insideHostelResult[0].insidehostel;

            connection.query(sql3, function (err, gateOutResult) {
              if (err) {
                console.error(err);
                res.status(500).send('Error executing SQL3 query');
                return;
              }

              result.gateOut = gateOutResult[0].gateout;

              connection.query(sql4, function (err, hostelOutResult) {
                if (err) {
                  console.error(err);
                  res.status(500).send('Error executing SQL4 query');
                  return;
                }

                result.hostelOut = hostelOutResult[0].hostelout;

                connection.query(sql5, function (err, citypass) {
                  if (err) {
                    console.error(err);
                    res.status(500).send('Error executing SQL5 query');
                    return;
                  }

                  result.citypass = citypass[0].citypass;

                  connection.query(sql6, function (err, homepass) {
                    if (err) {
                      console.error(err);
                      res.status(500).send('Error executing SQL6 query');
                      return;
                    }
                    result.homepass = homepass[0].homepass;
                    // Render the EJS template with the results
                    res.render(__dirname + '/views/reports', { result: result, message: req.flash('message') });
                  })
                });
              });
            });
          });
        });
      }
      else {
        req.flash('message', 'Unauthourised access ', role);
        res.redirect('/loginpanel');
      }
      connection.release();
    });

  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }

});

//Department Columns Chart

app.get('/deptdetails', (req, res) => {
  const query = "SELECT dept,count(*) as Count FROM studentdetails where category='Hostel' group by dept"; // Replace with your table name
  dbbconnection.getConnection(function (err, connection) {
    connection.query(query, (err, data) => {
      if (err) {
        console.error('Error fetching data from MySQL:', err);
        return res.status(500).send('Error fetching data from MySQL');
      }
      else {
        res.json(data)
      }


    });
  });
});



//Status pie chart api
app.get('/datastatus', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID") {
      dbbconnection.getConnection(function (err, connection) {
        var sql = "select status,count(*) as Count from studentdetails where (status='Restrict'or status='Unrestrict') and category='Hostel' group by status";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.json(result)
          }
        })
      })
    }
    else if (role == "BoysHostelAdmin" || role == "Hostelauthority") {
      dbbconnection.getConnection(function (err, connection) {
        var sql = "select status,count(*) as Count from studentdetails where gender='MALE' and category='Hostel' and (status='Restrict'or status='Unrestrict') group by status";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.json(result)
          }
        })
      })
    }
    else if (role == "GirlsHostelAdmin") {
      dbbconnection.getConnection(function (err, connection) {
        var sql = "select status,count(*) as Count from studentdetails where gender='FEMALE' and category='Hostel' and (status='Restrict'or status='Unrestrict') group by status";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.json(result)
          }
        })
      })
    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }

});



//line chart api
app.get('/datatimelines', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID") {
      dbbconnection.getConnection(function (err, connection) {
        var sql = "select hour(approvaldt) as Timeframe ,count(log.uid) as Count from log_details1 as log join studentdetails as stu where stu.uid=log.uid and DATE(approvaldt) = '" + convert(datetime(currentdate())) + "' and stu.category='Hostel' group by hour(approvaldt)";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.json(result)
          }
        })
      })
    }
    else if (role == "BoysHostelAdmin" || role == "Hostelauthority") {
      dbbconnection.getConnection(function (err, connection) {
        var sql = "select hour(approvaldt) as Timeframe ,count(log.uid) as Count from log_details1 as log join studentdetails as stu where stu.uid=log.uid and DATE(approvaldt) = '" + convert(datetime(currentdate())) + "' and stu.category='Hostel' and stu.gender='MALE' group by hour(approvaldt)";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.json(result)
          }
        })
      })
    }
    else if (role == "GirlsHostelAdmin") {
      dbbconnection.getConnection(function (err, connection) {
        var sql = "select hour(approvaldt) as Timeframe ,count(log.uid) as Count from log_details1 as log join studentdetails as stu where stu.uid=log.uid and DATE(approvaldt) = '" + convert(datetime(currentdate())) + "' and stu.category='Hostel' and stu.gender='FEMALE' group by hour(approvaldt)";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.json(result)
          }
        })
      })
    }

    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }

});


app.get('/takein/:uid', function (req, res) {
  var uid = req.params.uid;

  dbbconnection.getConnection(function (err, connection) {
    var sql = "select * From studentdetails where category='Hostel' and uid='" + uid + "' ";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      else {
        if (!result[0] == 0) {
          res.render(__dirname + '/views/takein');
        }
        else {
          req.flash('message', 'Please scan the Id of Hosteliers');
          res.redirect('/tokenhomepage');
        }
      }
    });
    connection.release();
  });
});


app.post('/takein/:logid', verifyjwt, function (req, res) {
  var logid = req.params.logid;

  dbbconnection.getConnection(function (err, connection) {
    var takeinquery = "Update log_details1 set status='DEAD',hostelintime='" + datetime(currentdate()) + "' where logid='" + logid + "'"
    connection.query(takeinquery, function (err, result) {
      if (err) throw err
      else {
        req.flash('message', 'Your log is updated successfully');
        res.redirect('/tokenhomepage');
      }
      connection.release();
    });
  });
});

//update time bound
app.post('/updatetimebound', verifyjwt, function (req, res) {
  var day = req.body.dropdownlist1;
  var start = req.body.StartTime1;
  var end = req.body.EndTime1;
  var start1 = req.body.StartTime2;
  var end1 = req.body.EndTime2;
  var hostel = req.body.hostel;
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      else if (role == "SuperID") {
        var sql = "Update timebound set start='" + start + "',end='" + end + "',start1='" + start1 + "',end1='" + end1 + "' where hostel='" + hostel + "' and days='" + day + "'";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            req.flash('message', 'Time Bound Updated successfully');
            res.redirect('/bound');
          }
        });
      }
      else if (role == "BoysHostelAdmin") {
        var sql = "Update timebound set start='" + start + "',end='" + end + "' ,start1='" + start1 + "',end1='" + end1 + "' where hostel='Boys' and days='" + day + "'";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            req.flash('message', 'Time Bound Updated successfully');
            res.redirect('/bound');
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var sql = "Update timebound set start='" + start + "',end='" + end + "' ,start1='" + start1 + "',end1='" + end1 + "' where hostel='Girls' and days='" + day + "'";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            req.flash('message', 'Time Bound Updated successfully');
            res.redirect('/bound');
          }
        });
      }
      else {
        req.flash('message', 'Unauthourised access ', role);
        res.redirect('/loginpanel');
      }
      connection.release();
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }


});


app.get('/token/:uid', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  const specificDate = new Date(datetime(currentdate())); // Create a new Date object
  const Time = datetime(currentdate()).split(" ", 3);
  const day = specificDate.getDay(); // Get the day of the week (0-6)

  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID" || role == "Hostelauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      var uid = req.params.uid;
      dbbconnection.getConnection(function (err, connection) {
        var sql = "select * From studentdetails where category='Hostel' and uid='" + uid + "' ";
        var details = "Select stu.uid,log.logid,stu.path,log.approvaldt from log_details1 as log left join studentdetails as stu on log.uid=stu.uid where logid=(select max(logid) from log_details1 where uid='" + uid + "')"

        connection.query(sql, function (err, result) {
          if (err) throw err;
          else if (result[0].status == 'Restrict') {
            req.flash('message', 'Your Id is Blocked, Please contact hostel admin');
            res.redirect('/tokenhomepage');
          }
          else {
            connection.query(details, function (err, details) {
              if (err) throw err;
              else {
                if (!result[0] == 0) {
                  if (result[0].gender == 'MALE') {

                    var logquery = "Select * from log_details1 where logid=(select max(logid) from log_details1 where uid='" + uid + "')";
                    connection.query(logquery, function (err, result1) {
                      if (err) throw err;
                      if (!result1[0] == 0) {
                        if (result1[0].status == 'ACTIVE') {
                          res.render(__dirname + '/views/takein', { result: details });
                        }
                        else if (result1[0].status == 'DEAD') {

                          if (!result1[0].hostelintime == 0) {

                            // var checktime = "SELECT * FROM timebound WHERE ((start <= '" + Time[2] + "' AND end>= '" + Time[2] + "') OR (start1 <= '" + Time[2] + "' AND end1>= '" + Time[2] + "')) AND dayno='" + day + "'AND hostel='Boys';";
                            // connection.query(checktime, function (err, check) {
                            // if (err) throw err;
                            // else if (!check[0] == 0) {
                            res.render(__dirname + '/views/token', { result: result });
                            // }
                            // else {

                            // req.flash('message', 'Time Bounded');
                            // res.redirect('/tokenhomepage');
                            // }
                            // });
                          }
                          else {
                            res.render(__dirname + '/views/takein', { result: details })
                          }

                        }
                        else {
                          req.flash('message', 'There is issue ERROR 131, Please Contact Admin');
                          res.redirect('/tokenhomepage');
                        }
                      }
                      else {
                        res.render(__dirname + '/views/token', { result: result });
                      }
                    })

                  }
                  else if (result[0].gender === 'FEMALE') {

                    var logquery = "Select * from log_details1 where logid=(select max(logid) from log_details1 where uid='" + uid + "')";
                    connection.query(logquery, function (err, result1) {
                      if (err) throw err;
                      if (!result1[0] == 0) {
                        if (result1[0].status == 'ACTIVE') {
                          res.render(__dirname + '/views/takein', { result: details });
                        }
                        else if (result1[0].status == 'DEAD') {

                          if (!result1[0].hostelintime == 0) {
                            // var checktime = "SELECT * FROM timebound WHERE start <= '" + Time[2] + "' AND end>= '" + Time[2] + "' and dayno='" + day + "'and hostel='Girls';";
                            // connection.query(checktime, function (err, check) {
                            // if (err) throw err;
                            // else if (!check[0] == 0) {
                            res.render(__dirname + '/views/token', { result: result });
                            // }
                            // else {
                            // req.flash('message', 'Time Bounded');
                            // res.redirect('/tokenhomepage');
                            // }
                            // });
                          }
                          else {
                            res.render(__dirname + '/views/takein', { result: details })
                          }

                        }
                        else {
                          req.flash('message', 'There is issue ERROR 131, Please Contact Admin');
                          res.redirect('/tokenhomepage');
                        }
                      }
                      else {
                        res.render(__dirname + '/views/token', { result: result });
                      }
                    })

                  }
                }
                else {
                  req.flash('message', 'Please scan the Id of Hosteliers');
                  res.redirect('/tokenhomepage');
                }
              }
            });
          }
        });
        connection.release();

      });
    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }



});


//List all user
app.get('/updateuser', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      else if (role == "SuperID") {

        var sql = "select * From admin ";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/updateuser', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "BoysHostelAdmin") {
        var sql = "select * From admin where hostel='Boys' ";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/updateuser', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var sql = "select * From admin where hostel='Girls' ";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/updateuser', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthourised access ', role);
        res.redirect('/loginpanel');
      }
      connection.release();
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }


});


//add user
app.get('/adduser', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;

    if (role == "SuperID" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      res.render(__dirname + '/views/adduser', { message: req.flash('message') });
    }
    else {
      req.flash('message', 'Unauthourised access ', role);
      res.redirect('/loginpanel');
    }
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }

});


app.get('/tokenhomepage', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID" || role == "Hostelauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      res.render(__dirname + '/views/tokenhomepage', { message: req.flash('message') });
    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }


});

//user profile
app.get('/userprofile/:uid', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;

    if (role == "SuperID" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      var uid = req.params.uid;
      dbbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        var sql = "Select * from admin where uid='" + uid + "'";

        connection.query(sql, function (err, result) {
          if (err) {

            throw err
          }

          else {
            res.render(__dirname + '/views/userprofile', { result: result, message: req.flash('message') });
          }

        });
        connection.release();
      });
    }
    else {
      req.flash('message', 'Unauthourised access ', role);
      res.redirect('/loginpanel');
    }

  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }



});

//Delete user
app.get('/deleteuser/:uid', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;

    if (role == "SuperID" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      var uid = req.params.uid;
      dbbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        var sql = "Delete from admin where uid = '" + uid + "'";

        connection.query(sql, function (err, result) {
          if (err) {

            throw err
          }

          else {
            req.flash('message', 'Deleted successfully');
            res.redirect('/updateuser');
          }

        });
        connection.release();
      });
    }
    else {
      req.flash('message', 'Unauthourised access ', role);
      res.redirect('/loginpanel');
    }

  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }



});



app.post('/saveuser/:id', async function (req, res) {
  var id = req.params.id;
  var uid = req.body.uid;
  var name = req.body.name;
  var category = req.body.category;
  let password = await bcrypt.hash(req.body.password, 12);
  var hostel = req.body.hostel;
  dbbconnection.getConnection(function (err, connection) {
    if (err) throw err;

    var sql = "Update admin set uid='" + uid + "',name='" + name + "',category='" + category + "',password='" + password + "',hostel='" + hostel + "' where adminid='" + id + "' ";

    connection.query(sql, function (err, result) {
      if (err) {

        throw err
      }

      else {
        req.flash('message', 'Updated successfully');
        res.redirect('/updateuser');
      }

    })
    connection.release();
  });


});



//add user
app.post('/adduser', async function (req, res) {
  var uid = req.body.uid;
  var name = req.body.name;
  var category = req.body.category;
  let password = await bcrypt.hash(req.body.password, 12);
  var hostel = req.body.hostel;
  dbbconnection.getConnection(function (err, connection) {
    if (err) throw err;

    var sql = "Insert into admin (uid,name,password,category,hostel) VALUES ? ";
    var values = [[uid, name, password, category, hostel]]

    connection.query(sql, [values], function (err, result) {
      if (err) {

        throw err
      }

      else {
        req.flash('message', 'Added successfully');
        res.redirect('/daterange');
      }

    })
    connection.release();
  });


});


//activetoken
app.get('/activepass', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and log.status='ACTIVE' and stu.category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/activepass', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and log.status='ACTIVE' and stu.category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/activepass', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "SuperID") {
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and log.status='ACTIVE' and stu.category='Hostel' ORDER BY log.logid desc";

        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/activepass', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised access');
        res.redirect('/loginpanel');
      }
      connection.release();
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
});
//Out student (hostel)(In provision)
app.get('/instudents/:id', verifyjwt, function (req, res) {

  var id = req.params.id;


  dbbconnection.getConnection(function (err, connection) {

    var sql = "Update log_details1 set hostelintime='" + datetime(currentdate()) + "',status='DEAD' where logid='" + id + "'";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      else {
        req.flash('message', 'Updated successfully');
        res.redirect('/outstudents');
      }
    });
    connection.release();
  });



});

//posting token in database with uid
app.post('/token/:uid', function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    var name = decode.adminname;
    dbbconnection.getConnection(function (err, connection) {
      var uid = req.params.uid;
      var passtype = req.body.radio;
      var sql = "Select * from log_details1 where logid= (Select max(logid) from log_details1 where uid='" + uid + "')";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {
          if (!result[0] == 0) {

            if (result[0].status == 'ACTIVE') {
              req.flash('message', 'New Pass can not be Created');
              res.redirect('/tokenhomepage');
            }
            else if (result[0].status == 'DEAD') {
              var insertsql1 = "Insert into log_details1 (uid,status,approvaldt,passtype,hosteloutauth) VALUES ('" + uid + "','ACTIVE','" + datetime(currentdate()) + "','" + passtype + "','" + name + "')";
              connection.query(insertsql1, function (err, result) {
                if (err) throw err;
                else {

                  // req.flash('message', 'Gate Pass Generated Successfully');
                  // res.redirect('/tokenhomepage');

                  //start
                  var fetchstu = "Select * from studentdetails where uid='" + uid + "'"
                  connection.query(fetchstu, function (err, fetched) {
                    const data = {
                      name: fetched[0].sname,
                      uid: fetched[0].uid,
                      date:datetime(currentdate()),
                      pass:passtype
                    };

                    // Render the email template with EJS
                    const renderedTemplate = ejs.render(emailTemplate, data);

                    // Email options
                    const mailOptions = {
                      from: 'tnps@stvincentngp.edu.in',
                      to: fetched[0].email,
                      subject: "Hostel Pass Generated successfully ['" + datetime(currentdate()) + "']",
                      html: renderedTemplate
                    };

                    // Send the email
                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        console.error(error);
                        console.log('message:',error)
                        req.flash('message', 'Gate Pass Generated Successfully');
                        res.redirect('/tokenhomepage');
                      } else {
                        console.log('Email sent:', info.response);
                        req.flash('message', 'Gate Pass Generated Successfully');
                        res.redirect('/tokenhomepage');
                      }
                    });
                  })
                  //end

                }
              })
            }

          }
          else {
            var insertsql1 = "Insert into log_details1 (uid,status,approvaldt,passtype,hosteloutauth) VALUES ('" + uid + "','ACTIVE','" + datetime(currentdate()) + "','" + passtype + "','" + name + "')";
            connection.query(insertsql1, function (err, result) {
              if (err) throw err;
              else {
                // req.flash('message', 'Gate Pass Generated Successfully');
                // res.redirect('/tokenhomepage');
                //start
                var fetchstu = "Select * from studentdetails where uid='" + uid + "'"
                connection.query(fetchstu, function (err, fetched) {
                  const data = {
                    name: fetched[0].sname,
                    uid: fetched[0].uid,
                    date:datetime(currentdate()),
                    pass:passtype
                  };

                  // Render the email template with EJS
                  const renderedTemplate = ejs.render(emailTemplate, data);

                  // Email options
                  const mailOptions = {
                    from: 'tnps@stvincentngp.edu.in',
                    to: fetched[0].email,
                    subject: "Pass is Generated for UID: '" + uid + "'",
                    html: renderedTemplate
                  };

                  // Send the email
                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.log('message:',error)
                      req.flash('message', 'Gate Pass Generated Successfully');
                      res.redirect('/tokenhomepage');
                    } else {
                      console.log('Email sent:', info.response);
                      req.flash('message', 'Gate Pass Generated Successfully');
                      res.redirect('/tokenhomepage');
                    }
                  });
                })
                //end
              }
            })
          }
        }
      });
      connection.release();
    })
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }

});

app.get('/studentsupdatehostel/:role', verifyjwt, function (req, res) {

  var role = req.params.role;
  dbbconnection.getConnection(function (err, connection) {
    if (role == "BoysHostelAdmin") {


      var sql = "select * from studentdetails where gender='MALE' and category='Hostel'";

      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {

          res.render(__dirname + '/views/studentsupdatehostel', { result: result, message: req.flash('message') });
        }
      });
    }
    else if (role == "GirlsHostelAdmin") {


      var sql = "select * from studentdetails where gender='FEMALE' and category='Hostel'";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {
          res.render(__dirname + '/views/studentsupdatehostel', { result: result, message: req.flash('message') });
        }
      });
    }
    else if (role == "SuperID") {
      var datefrom = req.body.datefrom;
      var dateto = req.body.dateto;

      var sql = "select * from studentdetails where category='Hostel'";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {
          res.render(__dirname + '/views/studentsupdatehostel', { result: result, message: req.flash('message') });
        }
      });
    }
    else {
      req.flash('message', 'Unauthorised Access');
      res.redirect('/loginpanel');
    }

    connection.release();
  });



});

app.get('/studentsupdate', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    var role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {


        var sql = "select * from studentdetails where gender='MALE'";

        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/studentsupdate', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {


        var sql = "select * from studentdetails where gender='FEMALE'";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/studentsupdate', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "SuperID") {


        var sql = "select * from studentdetails";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/studentsupdate', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }

      connection.release();
    });


  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Login failed');
    return res.redirect('/loginpanel');
  }

});

app.get('/insertcategory/:uid', verifyjwt, function (req, res) {

  var uid = req.params.uid;
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;

    dbbconnection.getConnection(function (err, connection) {

      var sql = "Update studentdetails set category='Hostel' where uid='" + uid + "'";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {
          req.flash('message', 'Added successfully');
          res.redirect('/studentsupdate');
        }
      });
      connection.release();
    });


  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Login failed');
    return res.redirect('/loginpanel');
  }

});

app.get('/codescanner/:uid', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  var inout;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID" || role == "Gateauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      var uid = req.params.uid;

      dbbconnection.getConnection(function (err, connection) {
        var sql = "select * From studentdetails where uid=? ";
        connection.query(sql, [uid], function (err, result) {
          if (err) throw err;
          else if (!result[0] == 0) {
            if (result[0].category == 0) {
              req.flash('message', 'Please mention the category,Contact admin');
              res.redirect('/homepage');
            }
            else {

              // in out button disable

              var logquery = "Select * from log_details1 where logid=(select max(logid) from log_details1 where uid='" + uid + "')";
                    connection.query(logquery, function (err, result1) {
                      if (err) throw err;
                      if (!result1[0] == 0) {
                       /*  var abc= result[0].status;
                        if (result1[0].status == 'ACTIVE') {
                          alert('New value: ' );
                        } */

                        
                        res.render(__dirname + '/views/codescanner', { result: result, result1: result1 });
                      }
                      else {
                       // inout="0";
                       //alert('New dfgdfgdfgdf value: ' );
                       req.flash('message', 'chk else');
                      }
                    })





              
              //res.render(__dirname + '/views/codescanner', { result: result }); res.render('index', { data1: results1, data2: results2 });
      




            }
      


             
            
          }
          else {
            req.flash('message', 'Invalid user');
            res.redirect('/homepage');
          }


        });
        connection.release();
      });
    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //


});

app.get('/codescanner1/:uid', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  const decode = jwt.verify(tokenadmin, secretkey);
  
  var name = decode.adminname;
  var inout;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    if (role == "SuperID" || role == "Gateauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      var uid = req.params.uid;

      dbbconnection.getConnection(function (err, connection) {
        var sql = "select * From studentdetails where uid=? ";
        connection.query(sql, [uid], function (err, result) {
          if (err) throw err;
          else if (!result[0] == 0) {
            if (result[0].category == 0) {
              req.flash('message', 'Please mention the category,Contact admin');
              res.redirect('/Collegepage');
            }
            else {

              // college student entry

              var insertsqlin1 = "Insert into log_detail(uid,indatetime,GuardName) VALUES ('" + uid + "','" + datetime(currentdate()) + "','" + name + "')";
              //var insertsqlin1 = "Insert into log_detail(uid,indatetime) VALUES ('" + uid + "','" + datetime(currentdate())+ "')";
              connection.query(insertsqlin1, function (err, result) {
                
                if (err) throw err;
                else {
                  req.flash('message', 'Submitted Successfully Z');
                  res.redirect('/Collegepage');
                }
              })



              
              //res.render(__dirname + '/views/codescanner', { result: result }); res.render('index', { data1: results1, data2: results2 });
      




            }
      


             
            
          }
          else {
            req.flash('message', 'Invalid user');
            res.redirect('/Collegepage');
          }


        });
        connection.release();
      });
    }
    else {
      req.flash('message', 'Unauthorised Access', role);
      return res.redirect('/loginpanel');
    }
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //


});


app.get('/daterange', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "SuperID") {

        res.render(__dirname + '/views/daterange', { message: req.flash('message') });
      }
      else if (role == "BoysHostelAdmin") {
        var sql = "select * from studentdetails where EXTRACT(DAY FROM dob)='" + getdate(currentdate()) + "' and extract(month from dob)='" + getmonth(currentdate()) + "'and category='Hostel' and gender='MALE'"
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/daterange', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var sql = "select * from studentdetails where EXTRACT(DAY FROM dob)='" + getdate(currentdate()) + "' and extract(month from dob)='" + getmonth(currentdate()) + "'and category='Hostel' and gender='FEMALE'"
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/daterange', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access', role);
        return res.redirect('/loginpanel');
      }
    })
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //


});




app.post('/daterange', function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;

        var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.passtype,log.hosteloutauth,CONCAT(FLOOR(HOUR(TIMEDIFF(outdatetime, indatetime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(outdatetime, indatetime)), 24), ' hours ',MINUTE(TIMEDIFF(outdatetime, indatetime)), ' minutes')AS `Duration`,CONCAT(FLOOR(HOUR(TIMEDIFF(approvaldt, hostelintime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(approvaldt, hostelintime)), 24), ' hours ',MINUTE(TIMEDIFF(approvaldt, hostelintime)), ' minutes') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc";

        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/hostelpanel2', { result: result, message: req.flash('message'), datefrom: datefrom, dateto: dateto });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;

        var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.passtype,log.hosteloutauth,CONCAT(FLOOR(HOUR(TIMEDIFF(outdatetime, indatetime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(outdatetime, indatetime)), 24), ' hours ',MINUTE(TIMEDIFF(outdatetime, indatetime)), ' minutes')AS `Duration`,CONCAT(FLOOR(HOUR(TIMEDIFF(approvaldt, hostelintime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(approvaldt, hostelintime)), 24), ' hours ',MINUTE(TIMEDIFF(approvaldt, hostelintime)), ' minutes') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/hostelpanel2', { result: result, message: req.flash('message'), datefrom: datefrom, dateto: dateto });
          }
        });
      }
      else if (role == "SuperID") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;

        var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.passtype,log.hosteloutauth,CONCAT(FLOOR(HOUR(TIMEDIFF(outdatetime, indatetime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(outdatetime, indatetime)), 24), ' hours ',MINUTE(TIMEDIFF(outdatetime, indatetime)), ' minutes')AS `Duration`,CONCAT(FLOOR(HOUR(TIMEDIFF(approvaldt, hostelintime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(approvaldt, hostelintime)), 24), ' hours ',MINUTE(TIMEDIFF(approvaldt, hostelintime)), ' minutes') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and ((date(log.outdatetime) between date('" + datefrom + "') and date('" + dateto + "')) or (date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "'))) ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/hostelpanel2', { result: result, message: req.flash('message'), datefrom: datefrom, dateto: dateto });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }

      connection.release();
    });

  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Login failed');
    return res.redirect('/loginpanel');
  }


});


//College Late Commer
app.get('/daterangeC', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "SuperID") {

        res.render(__dirname + '/views/CollegeLate', { message: req.flash('message') });
      }
      else if (role == "BoysHostelAdmin") {
        var sql = "select * from studentdetails where EXTRACT(DAY FROM dob)='" + getdate(currentdate()) + "' and extract(month from dob)='" + getmonth(currentdate()) + "'and category='Hostel' and gender='MALE'"
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/CollegeLate', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var sql = "select * from studentdetails where EXTRACT(DAY FROM dob)='" + getdate(currentdate()) + "' and extract(month from dob)='" + getmonth(currentdate()) + "'and category='Hostel' and gender='FEMALE'"
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/CollegeLate', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access', role);
        return res.redirect('/loginpanel');
      }
    })
  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
  //


});



//College late commer
app.post('/daterangeC', function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;

        var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.passtype,log.hosteloutauth,CONCAT(FLOOR(HOUR(TIMEDIFF(outdatetime, indatetime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(outdatetime, indatetime)), 24), ' hours ',MINUTE(TIMEDIFF(outdatetime, indatetime)), ' minutes')AS `Duration`,CONCAT(FLOOR(HOUR(TIMEDIFF(approvaldt, hostelintime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(approvaldt, hostelintime)), 24), ' hours ',MINUTE(TIMEDIFF(approvaldt, hostelintime)), ' minutes') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc";

        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/hostelpanel2', { result: result, message: req.flash('message'), datefrom: datefrom, dateto: dateto });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;

        var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.passtype,log.hosteloutauth,CONCAT(FLOOR(HOUR(TIMEDIFF(outdatetime, indatetime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(outdatetime, indatetime)), 24), ' hours ',MINUTE(TIMEDIFF(outdatetime, indatetime)), ' minutes')AS `Duration`,CONCAT(FLOOR(HOUR(TIMEDIFF(approvaldt, hostelintime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(approvaldt, hostelintime)), 24), ' hours ',MINUTE(TIMEDIFF(approvaldt, hostelintime)), ' minutes') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/hostelpanel2', { result: result, message: req.flash('message'), datefrom: datefrom, dateto: dateto });
          }
        });
      }
      else if (role == "SuperID") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;

        var sql = "select stu.uid,stu.sname,stu.dept,stu.year,log.indatetime,log.Guardname from log_detail as log join studentdetails as stu where stu.uid=log.uid and ((date(log.indatetime) between date('" + datefrom + "') and date('" + dateto + "'))) ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/hostelpanel2', { result: result, message: req.flash('message'), datefrom: datefrom, dateto: dateto });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }

      connection.release();
    });

  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Login failed');
    return res.redirect('/loginpanel');
  }


});


app.post('/codescanner/:uid', async function (req, res) {
  dbbconnection.getConnection(function (err, connection) {
    var uid = req.params.uid; 
    //var inout;
    var categoryquery = "Select category from studentdetails where uid='" + uid + "'";
    connection.query(categoryquery, function (err, result) {
      if (err) throw err;
      else {
        if (result[0].category == 'Day Scholar') {
          var mainsql = "Select * from log_details1 where uid='" + uid + "'";
          connection.query(mainsql, function (err, result) {

            if (err) throw err;
            else {
              if (!result[0] == 0)//if something value is coming from the database
              {
               //inout=1;
                
                if (!req.body.buttonout == 0) {

                  var sql = "Select * from log_details1 where logid=(Select max(logid) from log_details1 where uid='" + uid + "')";
                  connection.query(sql, function (err, result) {
                    if (err) throw err;
                    else {
                      if (!result[0].outdatetime == 0) {
                        var insertsql1 = "Insert into log_details1 (uid,outdatetime) VALUES ('" + uid + "','" + datetime(currentdate()) + "')";
                        connection.query(insertsql1, function (err, result) {
                          if (err) throw err;
                          else {
                            req.flash('message', 'Submitted Successfully');
                            res.redirect('/homepage');
                          }
                        })
                      }
                      else {

                        var updatesql1 = "Update log_details1 set outdatetime='" + datetime(currentdate()) + "' where logid='" + result[0].logid + "'";
                        connection.query(updatesql1, function (err, result) {
                          if (err) throw err;
                          else {
                            req.flash('message', 'Submitted Successfully');
                            res.redirect('/homepage');
                          }
                        })
                      }
                    }
                  });
                }
                else {
                  var sql = "Select * from log_details1 where logid=(Select max(logid) from log_details1 where uid='" + uid + "')";
                  connection.query(sql, function (err, result) {
                    if (err) throw err;
                    else {
                      if (!result[0].indatetime == 0) {
                        var insertsql1 = "Insert into log_details1 (uid,indatetime) VALUES ('" + uid + "','" + datetime(currentdate()) + "')";
                        connection.query(insertsql1, function (err, result) {
                          if (err) throw err;
                          else {
                            req.flash('message', 'Submitted Successfully');
                            res.redirect('/homepage');
                          }
                        })
                      }
                      else {

                        var updatesql1 = "Update log_details1 set indatetime='" + datetime(currentdate()) + "' where logid='" + result[0].logid + "'";
                        connection.query(updatesql1, function (err, result) {
                          if (err) throw err;
                          else {
                            req.flash('message', 'Submitted Successfully');
                            res.redirect('/homepage');
                          }
                        })
                      }
                    }
                  });
                }
              }
              else {
                if (!req.body.buttonout == 0)//OUT
                {

                  var sql = "Insert into log_details1 (uid,outdatetime) VALUES ? ";
                  var values = [
                    [uid, datetime(currentdate())]
                  ]
                  connection.query(sql, [values], function (err, result) {
                    if (err) throw err;
                    else {
                      req.flash('message', 'Submitted Successfully');
                      res.redirect('/homepage');
                    }
                  });
                }
                else//IN
                {
                  var sql = "Insert into log_details1 (uid,indatetime) VALUES ? ";
                  var values = [
                    [uid, datetime(currentdate())]
                  ]
                  connection.query(sql, [values], function (err, result) {
                    if (err) throw err;
                    else {
                      req.flash('message', 'Submitted Successfully');
                      res.redirect('/homepage');
                    }
                  });
                }
              }
            }
          })


        }
        else if (result[0].category == 'Hostel') {
          if (!req.body.buttonout == 0)//out
          {
            var statusquery = "Select * from log_details1 where logid=(Select max(logid) from log_details1 where uid='" + uid + "' and status='ACTIVE' )";
            connection.query(statusquery, function (err, result) {
              if (err) throw err;
              else if (result.length == 0) {
                req.flash('message', 'Hostel Pass is not generated');
                res.redirect('/homepage');
              }
              else if (result[0].status == 'ACTIVE') {
                var updatesql1 = "Update log_details1 set outdatetime='" + datetime(currentdate()) + "',status='DEAD' where logid='" + result[0].logid + "'";
                connection.query(updatesql1, function (err, result) {
                  if (err) throw err;
                  else {
                    req.flash('message', 'Submitted Successfully');
                    res.redirect('/homepage');
                  }
                })
              }
              else if (result[0].status == 'DEAD') {
                req.flash('message', 'Hostel Pass is not generated');
                res.redirect('/homepage');
              }
              else {
                req.flash('message', 'Failed 401, Contact admin');
                res.redirect('/homepage');
              }
            });
          }
          else//in
          {
            var statusquery = "Select * from log_details1 where logid=(Select max(logid) from log_details1 where uid='" + uid + "' )";
            connection.query(statusquery, function (err, result) {

              if (err) throw err;

              else if (!result[0].outdatetime == 0) {
                var updatesql1 = "Update log_details1 set indatetime='" + datetime(currentdate()) + "' where logid='" + result[0].logid + "'";
                connection.query(updatesql1, function (err, result) {
                  if (err) throw err;
                  else {
                    req.flash('message', 'Submitted Successfully');
                    res.redirect('/homepage');
                  }
                });
              }

              else {
                var insertsqlin = "Insert into log_details1 (uid,indatetime) VALUES ('" + uid + "','" + datetime(currentdate()) + "') ";

                connection.query(insertsqlin, function (err, result) {
                  if (err) throw err;
                  else {
                    req.flash('message', 'Submitted Successfully');
                    res.redirect('/homepage');
                  }
                });
              }
            });
          }
        }
        else {
          req.flash('message', 'Error not valid category, Contact admin');
          res.redirect('/homepage');
        }
      }
    })
    connection.release();
  })
});


app.post('/codescanner1/:uid', async function (req, res) {
  dbbconnection.getConnection(function (err, connection) {
    var uid = req.params.uid; 
    //var inout;
    var categoryquery = "Select category from studentdetails where uid='" + uid + "'";
    connection.query(categoryquery, function (err, result) {
      if (err) throw err;
      else {
        if (result[0].category == 'Day Scholar') {
          
          var insertsqlin1 = "Insert into log_detail (uid,indatetime,GuardName) VALUES ('" + uid + "','" + datetime(currentdate()) + "','" + name + "') ";
          //var insertsqlin1 = "Insert into log_detail(uid,indatetime) VALUES ('" + uid + "','" + datetime(currentdate())+ "')";
          connection.query(insertsqlin1, function (err, result) {
            
            if (err) throw err;
            else {
              req.flash('message', 'Submitted Successfully');
              res.redirect('/Collegepage');
            }
          })
        }
          
      }
    })
    connection.release();
  })
});

app.post('/updatestudent/:uid', function (req, res) {
  var uid = req.params.uid;
  var dept = req.body.Department;
  var academicyear = req.body.academicyear;
  var year = req.body.year;
  var category = req.body.category;
  var mobile = req.body.mobile;
  var status = req.body.Block;
  var gender = req.body.gender;
  var dob = req.body.dob;
  var address = req.body.address;
  var email = req.body.email;
  var ParentsName = req.body.ParentsName;
  var ParentsNumber = req.body.ParentsNumber;

  dbbconnection.getConnection(function (err, connection) {
    var sql = "UPDATE studentdetails SET email = '" + email + "', dept = '" + dept + "', address = '" + address + "', year = '" + year + "', category = '" + category + "', gender = '" + gender + "', mobileno = '" + mobile + "' , dob = '" + dob + "',academicyear = '" + academicyear + "' ,status = '" + status + "',parentname = '" + ParentsName + "',parentnumber = '" + ParentsNumber + "' WHERE uid='" + uid + "'; ";

    connection.query(sql, function (err, result) {
      if (err) throw err;
      else {
        req.flash('message', 'Updated Successfully');
        res.redirect('/studentprofile/' + uid + '');
      }


    });
    connection.release();
  });
});

app.get('/loginpanel', function (req, res) {

  res.render(__dirname + '/views/loginpanel', { message: req.flash('message') });
});


// Sign up page (render)
app.get('/signup', function (req, res) {
  res.render(__dirname + '/views/signup', { message: req.flash('message') });
});

// Sign up form handler - create admin user with bcrypt-hashed password
app.post('/signup', async function (req, res) {
  const UID = req.body.UID;
  const name = req.body.name || '';
  const password = req.body.password;
  const category = req.body.category;
  const Hostel = req.body.Hostel || null;

  if (!UID || !password || !category) {
    req.flash('message', 'UID, password and category are required');
    return res.redirect('/signup');
  }

  try {
    const hashed = await bcrypt.hash(password, 12);

    dbbconnection.getConnection(function (err, connection) {
      if (err) {
        console.error('DB connection error:', err);
        req.flash('message', 'Database connection error');
        return res.redirect('/signup');
      }

      const sql = 'INSERT INTO admin (uid, name, password, category, Hostel) VALUES (?, ?, ?, ?, ?)';
      const params = [UID, name, hashed, category, Hostel];

      connection.query(sql, params, function (err, result) {
        connection.release();
        if (err) {
          console.error('Error inserting admin:', err);
          // handle duplicate UID gracefully
          if (err.code === 'ER_DUP_ENTRY') {
            req.flash('message', 'UID already exists');
            return res.redirect('/signup');
          }
          req.flash('message', 'Error creating account');
          return res.redirect('/signup');
        }

        req.flash('message', 'Signup successful. Please login.');
        return res.redirect('/loginpanel');
      });
    });
  } catch (e) {
    console.error('Signup error:', e);
    req.flash('message', 'Server error');
    return res.redirect('/signup');
  }
});

app.get('/chart', function (req, res) {

  res.render(__dirname + '/views/chart', { message: req.flash('message') });
});

app.post('/loginpanel', function (req, res) {


  var UID = req.body.UID;

  dbbconnection.getConnection(function (err, connection) {
    var sql = "select * from admin where UID ='" + UID + "' ";
    connection.query(sql, function (err, result) {

      if (err) throw err;


      else if (result.length > 0) {
        bcrypt.compare(req.body.password, result[0].password, (berr, bresult) => {

          if (bresult) {

            const user = {
              role: result[0].category,
              adminname: result[0].name
            }

            jwt.sign(user, secretkey, {
              expiresIn: '10000s'
            }, (err, tokenadmin) => {

              res.cookie('jwt', tokenadmin, { httpOnly: true })
              try {
                const decode = jwt.verify(tokenadmin, secretkey);
                role = decode.role;
                if (role == "SuperID" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
                  res.redirect("/daterange");
                }
                else if (role == "Gateauthority") {
                  res.redirect("/homepage");
                }
                else if (role == "Hostelauthority") {
                  res.redirect("/tokenhomepage");
                }

              } catch (err) {
                res.clearCookie("jwt");
                req.flash('message', 'Something went wrong');
                return res.redirect('/loginpanel');
              }




            });
          }
          else {
            req.flash('message', 'Incorrect password');
            res.redirect('/loginpanel');
          }
        });

      }
      else {
        req.flash('message', 'Incorrect password');
        res.redirect('/loginpanel')
      }
    })
    connection.release();
  });

});
app.use(cookieParser());
function verifyjwt(req, res, next) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;

    next();
  }
  catch (err) {
    res.clearCookie("jwt");
    return res.redirect('/loginpanel');
  }
};





app.get('/hostelpanel', verifyjwt, function (req, res) {
  dbbconnection.getConnection(function (err, connection) {

    if (role == "BoysHostelAdmin") {
      var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.hosteloutauth,log.passtype,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 3600)/60), ' min ') AS `Duration`,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 3600)/60), ' min ') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and DATE(approvaldt) = '" + convert(datetime(currentdate())) + "' and category='Hostel' ORDER BY log.logid desc";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {

          res.render(__dirname + '/views/hostelpanel', { result: result, message: req.flash('message'), datetime: convert(datetime(currentdate())) });
        }
      });
    }
    else if (role == "GirlsHostelAdmin") {
      var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.hosteloutauth,log.passtype,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 3600)/60), ' min ') AS `Duration`,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 3600)/60), ' min ') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and DATE(approvaldt) = '" + convert(datetime(currentdate())) + "' and category='Hostel' ORDER BY log.logid desc";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {

          res.render(__dirname + '/views/hostelpanel', { result: result, message: req.flash('message'), datetime: convert(datetime(currentdate())) });
        }
      });
    }
    else if (role == "SuperID") {
      var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.hosteloutauth,log.passtype,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 3600)/60), ' min ') AS `Duration`,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 3600)/60), ' min ') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and ( DATE(outdatetime) = '" + convert(datetime(currentdate())) + "' or DATE(approvaldt) = '" + convert(datetime(currentdate())) + "') ORDER BY log.logid desc";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {

          res.render(__dirname + '/views/hostelpanel', { result: result, message: req.flash('message'), datetime: convert(datetime(currentdate())) });
        }
      });
    }
    else {
      req.flash('message', 'Unauthorised Access');
      res.redirect('/loginpanel');
    }

    connection.release();
  });

});

app.get('/CollegeLate', verifyjwt, function (req, res) {
  dbbconnection.getConnection(function (err, connection) {

    if (role == "BoysHostelAdmin") {
      var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.hosteloutauth,log.passtype,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 3600)/60), ' min ') AS `Duration`,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 3600)/60), ' min ') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and DATE(approvaldt) = '" + convert(datetime(currentdate())) + "' and category='Hostel' ORDER BY log.logid desc";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {

          res.render(__dirname + '/views/CollegeLate', { result: result, message: req.flash('message'), datetime: convert(datetime(currentdate())) });
        }
      });
    }
    else if (role == "GirlsHostelAdmin") {
      var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.hostelintime,log.hosteloutauth,log.passtype,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 3600)/60), ' min ') AS `Duration`,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 3600)/60), ' min ') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and DATE(approvaldt) = '" + convert(datetime(currentdate())) + "' and category='Hostel' ORDER BY log.logid desc";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        else {

          res.render(__dirname + '/views/CollegeLate', { result: result, message: req.flash('message'), datetime: convert(datetime(currentdate())) });
        }
      });
    }
    else if (role == "SuperID") {
      //var sql = "select stu.uid,stu.sname,stu.dept,stu.year,log.indatetime,log.Guardname from log_detail as log join studentdetails as stu where stu.uid=log.uid and ((date(log.indatetime) between date('" + datefrom + "') and date('" + dateto + "'))) ORDER BY log.logid desc";
      var sql = "select stu.uid,stu.sname,stu.dept,stu.year,log.indatetime,log.Guardname from log_detail as log join studentdetails as stu where stu.uid=log.uid ORDER BY log.logid desc";
        
        connection.query(sql, function (err, result) {
        if (err) throw err;
        else {

          res.render(__dirname + '/views/CollegeLate', { result: result, message: req.flash('message'), datetime: convert(datetime(currentdate())) });
        }
      });
    }
    else {
      req.flash('message', 'Unauthorised Access');
      res.redirect('/loginpanel');
    }

    connection.release();
  });

});

app.get('/studentprofile/:uid', verifyjwt, function (req, res) {
  var uid = req.params.uid;
  dbbconnection.getConnection(function (err, connection) {
    var sql = "select * From studentdetails where uid=? ";
    connection.query(sql, [uid], function (err, result) {
      if (err) throw err;
      else {
        res.render(__dirname + '/views/studentprofile', { message: req.flash('message'), result: result });
      }

    });
    connection.release();
  });
});

app.get('/logout', function (req, res) {
  res.clearCookie("jwt");
  res.render(__dirname + "/views/loginpanel", { message: req.flash('Logout Successfully') });
});

//out Hostel students route

app.get('/outstudents', verifyjwt, async function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var sql = "select log.logid,stu.uid,stu.sname,stu.status,log.hostelintime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and hostelintime is null and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/outstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var sql = "select log.logid,stu.uid,stu.sname,stu.status,log.hostelintime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and hostelintime is null and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/outstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "SuperID") {
        var sql = "select log.logid,stu.uid,stu.sname,stu.status,log.hostelintime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and hostelintime is null and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/outstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }
      connection.release();
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
});

//gate out Students
app.get('/Gateoutstudents', verifyjwt, function (req, res,) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var sql1 = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and indatetime is null and outdatetime IS NOT NULL and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql1, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/Gateoutstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var sql1 = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and indatetime is null and outdatetime IS NOT NULL and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql1, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/Gateoutstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "SuperID") {
        var sql1 = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and indatetime is null and outdatetime IS NOT NULL ORDER BY log.logid desc";
        connection.query(sql1, function (err, result) {
          if (err) throw err;
          else {

            res.render(__dirname + '/views/Gateoutstudents', { result: result, message: req.flash('message') });
          }
        });
      }

      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }
      connection.release();
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
});


//Out student (gate)(In provision)
app.get('/gateout/:id', verifyjwt, function (req, res) {

  var id = req.params.id;


  dbbconnection.getConnection(function (err, connection) {

    var sql = "Update log_details1 set indatetime='" + datetime(currentdate()) + "' where logid='" + id + "'";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      else {
        req.flash('message', 'Updated successfully');
        res.redirect('/Gateoutstudents');
      }
    });
    connection.release();
  });




});

//deactivate pass
app.get('/deacivatepass/:id', verifyjwt, function (req, res) {

  var id = req.params.id;


  dbbconnection.getConnection(function (err, connection) {

    var sql = "Update log_details1 set status='DEAD' where logid='" + id + "'";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      else {
        req.flash('message', 'Updated successfully');
        res.redirect('/activepass');
      }
    });
    connection.release();
  });




});

//importing excel
app.post('/import-excel', uploadFile.single('import-excel'), async function (req, res) {
  if (!req.file) {
    console.error("File not uploaded or an error occurred during upload.");
    return res.render('studentsupdate', {message: "Error: No file selected or file upload failed."});
  }
  console.log(req.file.path)
  await readXlsxFile(req.file.path).then((rows) => {
    rows.shift()
    dbbconnection.getConnection((error, connection) => {
      if (error) throw error;
      else {
        let sql = 'INSERT INTO studentdetails (`uid`, `sname`, `email`, `dept`, `address`, `year`, `category`, `gender`, `mobileno`, `dob`, `academicyear`, `path`,`status`,`parentname`,`parentnumber`,`other1`,`other2`,`other3`) VALUES ?'
        connection.query(sql, [rows], (error, response) => {
          if (error) throw error;
          req.flash('message', 'Added Successfully');
          res.redirect('/studentsupdate');
        })
      }
      connection.release();
    })
  })

})

app.get('/blankcsv', function (req, res) {
  res.download('public/documents/demoupload.xlsx');
});

//date range for Hostel out students
app.post('/hosteloutdaterange', function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.hostelintime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and hostelintime is null and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/outstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.hostelintime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and hostelintime is null and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/outstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "SuperID") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.hostelintime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and hostelintime is null and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/outstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }

      connection.release();
    });

  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Login failed');
    return res.redirect('/loginpanel');
  }


});

//date range for Gate out Students

app.post('/Gateoutdaterange', function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and indatetime is null and outdatetime IS NOT NULL and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc"
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/Gateoutstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and indatetime is null and outdatetime IS NOT NULL and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc"

        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/Gateoutstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "SuperID") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and indatetime is null and outdatetime IS NOT NULL and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and category='Hostel' ORDER BY log.logid desc"
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/Gateoutstudents', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }

      connection.release();
    });

  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Login failed');
    return res.redirect('/loginpanel');
  }


});

//Date range for Active pass

app.post('/activepassdaterange', function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='MALE' and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and log.status='ACTIVE' and stu.category='Hostel' ORDER BY log.logid desc";

        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/activepass', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "GirlsHostelAdmin") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.gender='FEMALE' and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and log.status='ACTIVE' and stu.category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/activepass', { result: result, message: req.flash('message') });
          }
        });
      }
      else if (role == "SuperID") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select log.logid,stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,log.passtype from log_details1 as log join studentdetails as stu where stu.uid=log.uid and date(log.approvaldt) between date('" + datefrom + "') and date('" + dateto + "') and log.status='ACTIVE' and stu.category='Hostel' ORDER BY log.logid desc";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          else {
            res.render(__dirname + '/views/activepass', { result: result, message: req.flash('message') });
          }
        });
      }
      else {
        req.flash('message', 'Unauthorised Access');
        res.redirect('/loginpanel');
      }

      connection.release();
    });

  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Login failed');
    return res.redirect('/loginpanel');
  }


});

//campus reports
app.get('/campusreports', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      else if (role == "SuperID") {
        var sql = "select stu.uid,stu.sname,log.indatetime,stu.dept,log.outdatetime,log.approvaldt,log.hostelintime,log.hosteloutauth,log.passtype,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.outdatetime, log.indatetime) % 3600)/60), ' min ') AS `Duration`,CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 86400)/3600), ' hours ',FLOOR((TIMESTAMPDIFF(SECOND, log.approvaldt, log.hostelintime) % 3600)/60), ' min ') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and stu.category='Day Scholar' ORDER BY log.logid desc"
        dbbconnection.query(sql, function (err, result) {


          if (err) throw err;
          else {
            res.render(__dirname + '/views/campusreports', { result: result, message: req.flash('message') })
          }
        })

      }
      else {
        req.flash('message', 'Unauthourised access ', role);
        res.redirect('/loginpanel');
      }
      connection.release();
    });

  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }

});

app.post('/daterangecampusreport', verifyjwt, function (req, res) {

  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);

    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      else if (role == "SuperID") {
        var datefrom = req.body.datefrom;
        var dateto = req.body.dateto;
        var sql = "select stu.uid,stu.sname,log.indatetime,log.outdatetime,log.approvaldt,stu.dept,log.hostelintime,log.passtype,log.hosteloutauth,CONCAT(FLOOR(HOUR(TIMEDIFF(outdatetime, indatetime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(outdatetime, indatetime)), 24), ' hours ',MINUTE(TIMEDIFF(outdatetime, indatetime)), ' minutes')AS `Duration`,CONCAT(FLOOR(HOUR(TIMEDIFF(approvaldt, hostelintime)) / 24), ' days ',MOD(HOUR(TIMEDIFF(approvaldt, hostelintime)), 24), ' hours ',MINUTE(TIMEDIFF(approvaldt, hostelintime)), ' minutes') AS `Durationh` from log_details1 as log join studentdetails as stu where stu.uid=log.uid and date(log.outdatetime) between date('" + datefrom + "') and date('" + dateto + "') and stu.category='Day Scholar' ORDER BY log.logid desc"
        dbbconnection.query(sql, function (err, result) {

          if (err) throw err;
          else {
            res.render(__dirname + '/views/campusreports', { result: result, message: req.flash('message') })
          }
        })

      }
      else {
        req.flash('message', 'Unauthourised access ', role);
        res.redirect('/loginpanel');
      }
      connection.release();
    });

  }

  catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }

});


function getSafeRedirectPath(req, fallback = '/outstudents') {
  const direct = req.query.redirect;
  if (direct && direct.startsWith('/')) {
    return direct;
  }
  const referer = req.get('Referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.pathname.startsWith('/')) {
        return refererUrl.pathname + refererUrl.search;
      }
    } catch (err) {
      // ignore malformed referer header
    }
  }
  return fallback;
}

app.get('/restrictstu/:uid', verifyjwt, function (req, res) {
  const redirectPath = getSafeRedirectPath(req);
  var uid = req.params.uid;
  dbbconnection.getConnection(function (err, connection) {

    var sql = "Update studentdetails set status='Restrict' where uid='" + uid + "'";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      else {
        req.flash('message', 'Restrict successfully');
        res.redirect(redirectPath);
      }
    });
    connection.release();
  });
})

app.get('/Unrestrictstu/:uid', verifyjwt, function (req, res) {
  const redirectPath = getSafeRedirectPath(req);
  var uid = req.params.uid;
  dbbconnection.getConnection(function (err, connection) {

    var sql = "Update studentdetails set status='Unrestrict' where uid='" + uid + "'";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      else {
        req.flash('message', 'UnRestrict successfully');
        res.redirect(redirectPath);
      }
    });
    connection.release();
  });
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port ", PORT);

});
//process.env.PORT
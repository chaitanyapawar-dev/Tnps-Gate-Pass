var dbbconnection = require('./server');
//server1 for offline
var express = require('express');
var app = express();
var bodyparser = require('body-parser');
const jwt = require('jsonwebtoken')
var path = require('path');
const secretkey = "secretkeysvpcet";
const studentSecretKey = "studentsecretkeysvpcet"; // Separate secret for student tokens
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

//Sick Leave - Scan ID page
app.get('/sickleave', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    role = decode.role;
    if (role == "SuperID" || role == "Hostelauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      res.render(__dirname + '/views/sickleave', { message: req.flash('message') });
    } else {
      req.flash('message', 'Unauthorised access');
      res.redirect('/loginpanel');
    }
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
});

//Sick Leave - Form page after scanning
app.get('/sickleaveform/:uid', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    role = decode.role;
    if (role == "SuperID" || role == "Hostelauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      var uid = req.params.uid;
      dbbconnection.getConnection(function (err, connection) {
        var sql = "select * from studentdetails where category='Hostel' and uid='" + uid + "'";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            res.render(__dirname + '/views/sickleaveform', { result: result, message: req.flash('message') });
          } else {
            req.flash('message', 'Student not found or not a hostel student');
            res.redirect('/sickleave');
          }
          connection.release();
        });
      });
    } else {
      req.flash('message', 'Unauthorised access');
      res.redirect('/loginpanel');
    }
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
});

//Sick Leave - Save sick leave record
app.post('/savesickleave/:uid', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    role = decode.role;
    var adminname = decode.adminname;
    if (role == "SuperID" || role == "Hostelauthority" || role == "BoysHostelAdmin" || role == "GirlsHostelAdmin") {
      var uid = req.params.uid;
      var illness = req.body.illness || req.body.other_illness;
      if (!illness || illness.trim() === '') {
        req.flash('message', 'Please select or enter an illness type');
        return res.redirect('/sickleaveform/' + uid);
      }
      // Sanitize illness input to prevent SQL injection
      illness = illness.trim().replace(/'/g, "''");
      
      dbbconnection.getConnection(function (err, connection) {
        var currentDateTime = datetime(currentdate());
        var logdate = currentDateTime.split(' ')[0];
        var logtime = currentDateTime.split(' ')[1] + ' ' + (currentDateTime.split(' ')[2] || '');
        
        var sql = "INSERT INTO sick_leave_logs (uid, illness, logdate, logtime, recorded_by, created_at) VALUES ('" + uid + "', '" + illness + "', '" + logdate + "', '" + logtime + "', '" + adminname + "', '" + currentDateTime + "')";
        connection.query(sql, function (err, result) {
          if (err) {
            console.error('Error saving sick leave:', err);
            req.flash('message', 'Error saving sick leave record. Please try again.');
            res.redirect('/sickleaveform/' + uid);
          } else {
            req.flash('message', 'Sick leave recorded successfully');
            res.redirect('/sickleave');
          }
          connection.release();
        });
      });
    } else {
      req.flash('message', 'Unauthorised access');
      res.redirect('/loginpanel');
    }
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
});

//Sick Leave - View logs
app.get('/sickleavelogs', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    role = decode.role;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var sql = "SELECT sl.*, stu.sname, stu.dept FROM sick_leave_logs as sl JOIN studentdetails as stu ON sl.uid = stu.uid WHERE stu.gender='MALE' AND stu.category='Hostel' ORDER BY sl.created_at DESC LIMIT 100";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          res.render(__dirname + '/views/sickleavelogs', { result: result, message: req.flash('message'), role: role });
          connection.release();
        });
      } else if (role == "GirlsHostelAdmin") {
        var sql = "SELECT sl.*, stu.sname, stu.dept FROM sick_leave_logs as sl JOIN studentdetails as stu ON sl.uid = stu.uid WHERE stu.gender='FEMALE' AND stu.category='Hostel' ORDER BY sl.created_at DESC LIMIT 100";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          res.render(__dirname + '/views/sickleavelogs', { result: result, message: req.flash('message'), role: role });
          connection.release();
        });
      } else if (role == "SuperID") {
        var sql = "SELECT sl.*, stu.sname, stu.dept FROM sick_leave_logs as sl JOIN studentdetails as stu ON sl.uid = stu.uid WHERE stu.category='Hostel' ORDER BY sl.created_at DESC LIMIT 100";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          res.render(__dirname + '/views/sickleavelogs', { result: result, message: req.flash('message'), role: role });
          connection.release();
        });
      } else {
        req.flash('message', 'Unauthorised access');
        res.redirect('/loginpanel');
        connection.release();
      }
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
    return res.redirect('/loginpanel');
  }
});

//Sick Leave - Date range filter
app.post('/sickleavelogsdaterange', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    role = decode.role;
    var datefrom = req.body.datefrom;
    var dateto = req.body.dateto;
    dbbconnection.getConnection(function (err, connection) {
      if (role == "BoysHostelAdmin") {
        var sql = "SELECT sl.*, stu.sname, stu.dept FROM sick_leave_logs as sl JOIN studentdetails as stu ON sl.uid = stu.uid WHERE stu.gender='MALE' AND stu.category='Hostel' AND date(sl.logdate) BETWEEN date('" + datefrom + "') AND date('" + dateto + "') ORDER BY sl.created_at DESC";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          res.render(__dirname + '/views/sickleavelogs', { result: result, message: req.flash('message'), role: role });
          connection.release();
        });
      } else if (role == "GirlsHostelAdmin") {
        var sql = "SELECT sl.*, stu.sname, stu.dept FROM sick_leave_logs as sl JOIN studentdetails as stu ON sl.uid = stu.uid WHERE stu.gender='FEMALE' AND stu.category='Hostel' AND date(sl.logdate) BETWEEN date('" + datefrom + "') AND date('" + dateto + "') ORDER BY sl.created_at DESC";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          res.render(__dirname + '/views/sickleavelogs', { result: result, message: req.flash('message'), role: role });
          connection.release();
        });
      } else if (role == "SuperID") {
        var sql = "SELECT sl.*, stu.sname, stu.dept FROM sick_leave_logs as sl JOIN studentdetails as stu ON sl.uid = stu.uid WHERE stu.category='Hostel' AND date(sl.logdate) BETWEEN date('" + datefrom + "') AND date('" + dateto + "') ORDER BY sl.created_at DESC";
        connection.query(sql, function (err, result) {
          if (err) throw err;
          res.render(__dirname + '/views/sickleavelogs', { result: result, message: req.flash('message'), role: role });
          connection.release();
        });
      } else {
        req.flash('message', 'Unauthorised access');
        res.redirect('/loginpanel');
        connection.release();
      }
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Something went wrong');
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


// =====================================================
// STUDENT PORTAL ROUTES
// =====================================================

// Student JWT Verification Middleware
function verifyStudentJwt(req, res, next) {
  const studentToken = req.cookies.studentjwt;
  try {
    const decode = jwt.verify(studentToken, studentSecretKey);
    req.studentUid = decode.uid;
    req.studentName = decode.name;
    next();
  } catch (err) {
    res.clearCookie("studentjwt");
    return res.redirect('/student/login');
  }
}

// Student Login Page
app.get('/student/login', function (req, res) {
  res.render(__dirname + '/views/studentlogin', { message: req.flash('message') });
});

// Student Login Handler
app.post('/student/login', function (req, res) {
  const uid = req.body.uid;
  const password = req.body.password;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database connection error');
      return res.redirect('/student/login');
    }

    // First check if student exists
    var sql = "SELECT * FROM studentdetails WHERE uid = ?";
    connection.query(sql, [uid], function (err, result) {
      if (err) {
        connection.release();
        req.flash('message', 'Error occurred');
        return res.redirect('/student/login');
      }

      if (result.length === 0) {
        connection.release();
        req.flash('message', 'Student not found');
        return res.redirect('/student/login');
      }

      const student = result[0];
      
      // Check if student has a password set, if not use mobile number as default
      // For first-time login, password should match mobile number
      const studentPassword = student.password || student.mobileno;
      
      // If password exists and is hashed (starts with $2), use bcrypt compare
      if (student.password && student.password.startsWith('$2')) {
        bcrypt.compare(password, student.password, function (berr, bresult) {
          connection.release();
          if (bresult) {
            createStudentSession(req, res, student);
          } else {
            req.flash('message', 'Incorrect password');
            return res.redirect('/student/login');
          }
        });
      } else {
        // Plain text comparison (mobile number as default password)
        connection.release();
        if (password === studentPassword) {
          createStudentSession(req, res, student);
        } else {
          req.flash('message', 'Incorrect password. Use your mobile number as default password.');
          return res.redirect('/student/login');
        }
      }
    });
  });
});

// Helper function to create student session
function createStudentSession(req, res, student) {
  const studentData = {
    uid: student.uid,
    name: student.sname,
    category: student.category
  };

  jwt.sign(studentData, studentSecretKey, { expiresIn: '24h' }, (err, token) => {
    if (err) {
      req.flash('message', 'Error creating session');
      return res.redirect('/student/login');
    }
    res.cookie('studentjwt', token, { httpOnly: true });
    res.redirect('/student/dashboard');
  });
}

// Student Dashboard
app.get('/student/dashboard', verifyStudentJwt, function (req, res) {
  const uid = req.studentUid;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/login');
    }

    // Get student details
    var studentSql = "SELECT * FROM studentdetails WHERE uid = ?";
    connection.query(studentSql, [uid], function (err, studentResult) {
      if (err || studentResult.length === 0) {
        connection.release();
        req.flash('message', 'Student not found');
        return res.redirect('/student/login');
      }

      const student = studentResult[0];

      // Get statistics
      var statsSql = "SELECT COUNT(*) as totalPasses FROM log_details1 WHERE uid = ? AND passtype IS NOT NULL";
      var monthStatsSql = "SELECT COUNT(*) as monthPasses FROM log_details1 WHERE uid = ? AND passtype IS NOT NULL AND MONTH(approvaldt) = MONTH(CURDATE()) AND YEAR(approvaldt) = YEAR(CURDATE())";
      var activePassSql = "SELECT * FROM log_details1 WHERE uid = ? AND status = 'ACTIVE' ORDER BY logid DESC LIMIT 1";
      var recentLogsSql = "SELECT * FROM log_details1 WHERE uid = ? ORDER BY logid DESC LIMIT 10";

      connection.query(statsSql, [uid], function (err, statsResult) {
        connection.query(monthStatsSql, [uid], function (err, monthResult) {
          connection.query(activePassSql, [uid], function (err, activeResult) {
            connection.query(recentLogsSql, [uid], function (err, recentResult) {
              connection.release();

              const stats = {
                totalPasses: statsResult[0] ? statsResult[0].totalPasses : 0,
                monthPasses: monthResult[0] ? monthResult[0].monthPasses : 0
              };

              const activePass = activeResult.length > 0 ? activeResult[0] : null;
              const recentLogs = recentResult || [];

              res.render(__dirname + '/views/studentdashboard', {
                student: student,
                stats: stats,
                activePass: activePass,
                recentLogs: recentLogs,
                message: req.flash('message')
              });
            });
          });
        });
      });
    });
  });
});

// API to get all available rooms
app.get('/api/rooms', verifyStudentJwt, function (req, res) {
  const bookingDate = req.query.bookingDate;
  const selectedBlock = req.query.block; 
  const selectedFloor = req.query.floor; 

  if (!bookingDate) {
    return res.status(400).json({ message: 'Booking date is required.' });
  }

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    let sql = `
      SELECT 
          r.id, 
          r.name, 
          r.capacity, 
          r.price_per_night, 
          r.description, 
          r.is_available, 
          r.block, 
          r.floor, 
          r.room_type,
          CASE
              WHEN MAX(b.id) IS NOT NULL THEN 'on_hold'
              ELSE 'available'
          END AS current_status
      FROM 
          rooms r
      LEFT JOIN 
          bookings b ON r.id = b.room_id
          AND b.booking_date = ?
          AND b.status IN ('on_hold', 'confirmed')
      WHERE 
          r.is_available = TRUE
    `;
    const queryParams = [bookingDate];

    if (selectedBlock) {
      sql += ` AND r.block = ?`;
      queryParams.push(selectedBlock);
    }
    if (selectedFloor) {
      sql += ` AND r.floor = ?`;
      queryParams.push(selectedFloor);
    }

    sql += `
      GROUP BY r.id 
      ORDER BY r.block, r.floor, r.name
    `;
    
    connection.query(sql, queryParams, function (err, results) {
      connection.release();
      if (err) {
        console.error('Error fetching rooms:', err);
        return res.status(500).json({ message: 'Error fetching rooms' });
      }
      res.json(results);
    });
  });
});

// API to create a new booking
app.post('/api/bookings', verifyStudentJwt, function (req, res) {
  const studentId = req.studentUid; // From JWT token
  const { roomId, bookingDate, selectedRoomPrice } = req.body; // Updated params

  if (!roomId || !bookingDate || !selectedRoomPrice) {
    return res.status(400).json({ message: 'Missing required booking information' });
  }

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Check for overlapping bookings for the selected room and date
    const checkAvailabilitySql = `
      SELECT COUNT(*) AS count FROM bookings
      WHERE room_id = ?
      AND booking_date = ?
      AND status IN ('on_hold', 'confirmed')
    `;
    
    connection.query(checkAvailabilitySql, [roomId, bookingDate], function (err, availabilityResults) {
      if (err) {
        connection.release();
        console.error('Error checking room availability:', err);
        return res.status(500).json({ message: 'Error checking room availability' });
      }

      if (availabilityResults[0].count > 0) {
        connection.release();
        return res.status(409).json({ message: 'Room is not available for the selected date' });
      }

      // Insert new booking
      const insertBookingSql = "INSERT INTO bookings (room_id, student_id, booking_date, total_price, status, payment_status) VALUES (?, ?, ?, ?, ?, ?)";
      connection.query(insertBookingSql, [roomId, studentId, bookingDate, selectedRoomPrice, 'on_hold', 'pending'], function (err, bookingResults) {
        connection.release();
        if (err) {
          console.error('Error creating booking:', err);
          return res.status(500).json({ message: 'Error creating booking' });
        }
        res.status(201).json({ message: 'Booking created successfully and is on hold for payment.', bookingId: bookingResults.insertId });
      });
    });
  });
});

// API to get a student's booking history
app.get('/api/student/bookings', verifyStudentJwt, function (req, res) {
  const studentId = req.studentUid; // From JWT token

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    const sql = `
      SELECT 
          b.*, 
          r.name as room_name, 
          r.capacity, 
          r.price_per_night,
          r.block,
          r.floor,
          r.room_type
      FROM 
          bookings b
      JOIN 
          rooms r ON b.room_id = r.id
      WHERE 
          b.student_id = ?
      ORDER BY 
          b.booking_date DESC, b.created_at DESC
    `;

    connection.query(sql, [studentId], function (err, results) {
      connection.release();
      if (err) {
        console.error('Error fetching student bookings:', err);
        return res.status(500).json({ message: 'Error fetching student bookings' });
      }
      res.json(results);
    });
  });
});

// Student Profile
app.get('/student/profile', verifyStudentJwt, function (req, res) {
  const uid = req.studentUid;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/dashboard');
    }

    var sql = "SELECT * FROM studentdetails WHERE uid = ?";
    connection.query(sql, [uid], function (err, result) {
      connection.release();
      if (err || result.length === 0) {
        req.flash('message', 'Student not found');
        return res.redirect('/student/dashboard');
      }

      res.render(__dirname + '/views/student_profile', {
        student: result[0],
        message: req.flash('message')
      });
    });
  });
});

// Student Change Password
app.post('/student/changepassword', verifyStudentJwt, async function (req, res) {
  const uid = req.studentUid;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    req.flash('message', 'New passwords do not match');
    return res.redirect('/student/profile');
  }

  if (newPassword.length < 6) {
    req.flash('message', 'Password must be at least 6 characters');
    return res.redirect('/student/profile');
  }

  dbbconnection.getConnection(async function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/profile');
    }

    // Get current student data
    var sql = "SELECT * FROM studentdetails WHERE uid = ?";
    connection.query(sql, [uid], async function (err, result) {
      if (err || result.length === 0) {
        connection.release();
        req.flash('message', 'Student not found');
        return res.redirect('/student/profile');
      }

      const student = result[0];
      const storedPassword = student.password || student.mobileno;

      // Verify current password
      let passwordMatch = false;
      if (student.password && student.password.startsWith('$2')) {
        passwordMatch = await bcrypt.compare(currentPassword, student.password);
      } else {
        passwordMatch = currentPassword === storedPassword;
      }

      if (!passwordMatch) {
        connection.release();
        req.flash('message', 'Current password is incorrect');
        return res.redirect('/student/profile');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      var updateSql = "UPDATE studentdetails SET password = ? WHERE uid = ?";
      connection.query(updateSql, [hashedPassword, uid], function (err, updateResult) {
        connection.release();
        if (err) {
          req.flash('message', 'Error updating password');
          return res.redirect('/student/profile');
        }

        req.flash('message', 'Password updated successfully');
        res.redirect('/student/profile');
      });
    });
  });
}); 

// Student Attendance
app.get('/student/attendance', verifyStudentJwt, function (req, res) {
  const uid = req.studentUid;
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/dashboard');
    }

    // Get student details
    var studentSql = "SELECT * FROM studentdetails WHERE uid = ?";
    connection.query(studentSql, [uid], function (err, studentResult) {
      if (err || studentResult.length === 0) {
        connection.release();
        return res.redirect('/student/dashboard');
      }

      const student = studentResult[0];

      // Build attendance query with date filter
      var attendanceSql = `
        SELECT *, 
        CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, outdatetime, indatetime) % 86400)/3600), ' hrs ', 
               FLOOR((TIMESTAMPDIFF(SECOND, outdatetime, indatetime) % 3600)/60), ' min') AS Duration 
        FROM log_details1 WHERE uid = ?`;
      
      var params = [uid];

      if (fromDate && toDate) {
        attendanceSql += " AND DATE(COALESCE(approvaldt, outdatetime, indatetime)) BETWEEN ? AND ?";
        params.push(fromDate, toDate);
      }

      attendanceSql += " ORDER BY logid DESC LIMIT 100";

      connection.query(attendanceSql, params, function (err, attendanceResult) {
        // Get statistics
        var statsSql = `
          SELECT 
            COUNT(CASE WHEN indatetime IS NOT NULL THEN 1 END) as totalEntries,
            COUNT(CASE WHEN outdatetime IS NOT NULL THEN 1 END) as totalExits,
            COUNT(CASE WHEN MONTH(COALESCE(approvaldt, outdatetime, indatetime)) = MONTH(CURDATE()) THEN 1 END) as monthMovements
          FROM log_details1 WHERE uid = ?`;

        connection.query(statsSql, [uid], function (err, statsResult) {
          // Check if currently outside
          var currentSql = "SELECT * FROM log_details1 WHERE uid = ? AND (status = 'ACTIVE' OR (outdatetime IS NOT NULL AND indatetime IS NULL)) ORDER BY logid DESC LIMIT 1";
          connection.query(currentSql, [uid], function (err, currentResult) {
            connection.release();

            const currentlyOut = currentResult.length > 0 && 
              (currentResult[0].status === 'ACTIVE' || 
               (currentResult[0].outdatetime && !currentResult[0].indatetime));

            res.render(__dirname + '/views/student_attendance', {
              student: student,
              attendance: attendanceResult || [],
              stats: statsResult[0] || { totalEntries: 0, totalExits: 0, monthMovements: 0 },
              currentlyOut: currentlyOut,
              fromDate: fromDate || '',
              toDate: toDate || '',
              message: req.flash('message')
            });
          });
        });
      });
    });
  });
});

// Student Pass History
app.get('/student/passhistory', verifyStudentJwt, function (req, res) {
  const uid = req.studentUid;
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;
  const passType = req.query.passType;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/dashboard');
    }

    // Get student details
    var studentSql = "SELECT * FROM studentdetails WHERE uid = ?";
    connection.query(studentSql, [uid], function (err, studentResult) {
      if (err || studentResult.length === 0) {
        connection.release();
        return res.redirect('/student/dashboard');
      }

      const student = studentResult[0];

      // Build pass history query
      var passSql = `
        SELECT *,
        CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, outdatetime, indatetime) % 86400)/3600), ' hrs ', 
               FLOOR((TIMESTAMPDIFF(SECOND, outdatetime, indatetime) % 3600)/60), ' min') AS Duration,
        CONCAT(FLOOR((TIMESTAMPDIFF(SECOND, approvaldt, hostelintime) % 86400)/3600), ' hrs ', 
               FLOOR((TIMESTAMPDIFF(SECOND, approvaldt, hostelintime) % 3600)/60), ' min') AS Durationh
        FROM log_details1 WHERE uid = ? AND passtype IS NOT NULL`;
      
      var params = [uid];

      if (fromDate && toDate) {
        passSql += " AND DATE(approvaldt) BETWEEN ? AND ?";
        params.push(fromDate, toDate);
      }

      if (passType) {
        passSql += " AND passtype = ?";
        params.push(passType);
      }

      passSql += " ORDER BY logid DESC LIMIT 100";

      connection.query(passSql, params, function (err, passResult) {
        // Get statistics
        var statsSql = `
          SELECT 
            COUNT(*) as totalPasses,
            COUNT(CASE WHEN passtype = 'City Pass' THEN 1 END) as cityPasses,
            COUNT(CASE WHEN passtype = 'Home Pass' THEN 1 END) as homePasses,
            COUNT(CASE WHEN MONTH(approvaldt) = MONTH(CURDATE()) AND YEAR(approvaldt) = YEAR(CURDATE()) THEN 1 END) as monthPasses
          FROM log_details1 WHERE uid = ? AND passtype IS NOT NULL`;

        connection.query(statsSql, [uid], function (err, statsResult) {
          // Get active pass
          var activeSql = "SELECT * FROM log_details1 WHERE uid = ? AND status = 'ACTIVE' ORDER BY logid DESC LIMIT 1";
          connection.query(activeSql, [uid], function (err, activeResult) {
            connection.release();

            res.render(__dirname + '/views/student_passhistory', {
              student: student,
              passes: passResult || [],
              stats: statsResult[0] || { totalPasses: 0, cityPasses: 0, homePasses: 0, monthPasses: 0 },
              activePass: activeResult.length > 0 ? activeResult[0] : null,
              fromDate: fromDate || '',
              toDate: toDate || '',
              passType: passType || '',
              message: req.flash('message')
            });
          });
        });
      });
    });
  });
});

// Student Request Pass Page
app.get('/student/requestpass', verifyStudentJwt, function (req, res) {
  const uid = req.studentUid;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/dashboard');
    }

    // Get student details
    var studentSql = "SELECT * FROM studentdetails WHERE uid = ?";
    connection.query(studentSql, [uid], function (err, studentResult) {
      if (err || studentResult.length === 0) {
        connection.release();
        return res.redirect('/student/dashboard');
      }

      const student = studentResult[0];

      // Check for active pass
      var activeSql = "SELECT * FROM log_details1 WHERE uid = ? AND status = 'ACTIVE' ORDER BY logid DESC LIMIT 1";
      connection.query(activeSql, [uid], function (err, activeResult) {
        // Get pending requests
        var pendingSql = "SELECT * FROM pass_requests WHERE uid = ? AND status = 'pending' ORDER BY created_at DESC";
        connection.query(pendingSql, [uid], function (err, pendingResult) {
          connection.release();

          res.render(__dirname + '/views/student_requestpass', {
            student: student,
            activePass: activeResult.length > 0 ? activeResult[0] : null,
            pendingRequests: pendingResult || [],
            message: req.flash('message')
          });
        });
      });
    });
  });
});

// Student Submit Pass Request
app.post('/student/requestpass', verifyStudentJwt, function (req, res) {
  const uid = req.studentUid;
  const { passType, expectedOutDate, expectedOutTime, expectedReturnDate, expectedReturnTime, reason, emergencyContact } = req.body;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/requestpass');
    }

    // Check if student is restricted
    var checkSql = "SELECT status FROM studentdetails WHERE uid = ?";
    connection.query(checkSql, [uid], function (err, checkResult) {
      if (err || checkResult.length === 0 || checkResult[0].status === 'Restrict') {
        connection.release();
        req.flash('message', 'Cannot submit request. Account may be restricted.');
        return res.redirect('/student/requestpass');
      }

      // Check for existing active pass
      var activeSql = "SELECT * FROM log_details1 WHERE uid = ? AND status = 'ACTIVE'";
      connection.query(activeSql, [uid], function (err, activeResult) {
        if (activeResult && activeResult.length > 0) {
          connection.release();
          req.flash('message', 'You already have an active pass');
          return res.redirect('/student/requestpass');
        }

        // Insert pass request
        var insertSql = `
          INSERT INTO pass_requests 
          (uid, passtype, expected_out, expected_return, reason, emergency_contact, status, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`;

        var expectedOut = expectedOutDate + ' ' + expectedOutTime;
        var expectedReturn = expectedReturnDate + ' ' + (expectedReturnTime || '18:00');

        connection.query(insertSql, [uid, passType, expectedOut, expectedReturn, reason, emergencyContact], function (err, insertResult) {
          connection.release();
          if (err) {
            // If table doesn't exist, create it
            if (err.code === 'ER_NO_SUCH_TABLE') {
              req.flash('message', 'Pass request feature is being set up. Please contact admin.');
            } else {
              req.flash('message', 'Error submitting request');
            }
            return res.redirect('/student/requestpass');
          }

          req.flash('message', 'Pass request submitted successfully! Awaiting approval.');
          res.redirect('/student/requestpass');
        });
      });
    });
  });
});

// Cancel Pass Request
app.get('/student/cancelrequest/:id', verifyStudentJwt, function (req, res) {
  const uid = req.studentUid;
  const requestId = req.params.id;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/requestpass');
    }

    var deleteSql = "DELETE FROM pass_requests WHERE requestid = ? AND uid = ? AND status = 'pending'";
    connection.query(deleteSql, [requestId, uid], function (err, result) {
      connection.release();
      if (err) {
        req.flash('message', 'Error canceling request');
      } else {
        req.flash('message', 'Request canceled successfully');
      }
      res.redirect('/student/requestpass');
    });
  });
});

// Student Notifications
app.get('/student/notifications', verifyStudentJwt, function (req, res) {
  const uid = req.studentUid;
  const filter = req.query.filter;

  dbbconnection.getConnection(function (err, connection) {
    if (err) {
      req.flash('message', 'Database error');
      return res.redirect('/student/dashboard');
    }

    // Get student details
    var studentSql = "SELECT * FROM studentdetails WHERE uid = ?";
    connection.query(studentSql, [uid], function (err, studentResult) {
      if (err || studentResult.length === 0) {
        connection.release();
        return res.redirect('/student/dashboard');
      }

      const student = studentResult[0];

      // Get recent passes for notifications
      var recentSql = "SELECT * FROM log_details1 WHERE uid = ? AND passtype IS NOT NULL ORDER BY logid DESC LIMIT 10";
      connection.query(recentSql, [uid], function (err, recentResult) {
        // Try to get notifications from table if exists
        var notifSql = "SELECT * FROM student_notifications WHERE uid = ? ORDER BY created_at DESC LIMIT 50";
        connection.query(notifSql, [uid], function (err, notifResult) {
          connection.release();

          res.render(__dirname + '/views/student_notifications', {
            student: student,
            notifications: notifResult || [],
            recentPasses: recentResult || [],
            filter: filter || '',
            message: req.flash('message')
          });
        });
      });
    });
  });
});

// Student Logout
app.get('/student/logout', function (req, res) {
  res.clearCookie('studentjwt');
  req.flash('message', 'Logged out successfully');
  res.redirect('/student/login');
});


// =====================================================
// ADMIN - PASS REQUEST MANAGEMENT
// =====================================================

// Admin - View Pass Requests
app.get('/admin/passrequests', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    const role = decode.role;

    if (role !== "SuperID" && role !== "BoysHostelAdmin" && role !== "GirlsHostelAdmin" && role !== "Hostelauthority") {
      req.flash('message', 'Unauthorized access');
      return res.redirect('/loginpanel');
    }

    const filterStatus = req.query.status || '';
    const fromDate = req.query.fromDate || '';
    const toDate = req.query.toDate || '';

    dbbconnection.getConnection(function (err, connection) {
      if (err) {
        req.flash('message', 'Database error');
        return res.redirect('/daterange');
      }

      // Build query based on role
      let baseSql = `
        SELECT pr.*, sd.sname, sd.dept, sd.mobileno, sd.gender 
        FROM pass_requests pr 
        LEFT JOIN studentdetails sd ON pr.uid = sd.uid 
        WHERE 1=1`;
      
      let params = [];

      // Filter by gender based on admin role
      if (role === "BoysHostelAdmin") {
        baseSql += " AND sd.gender = 'MALE'";
      } else if (role === "GirlsHostelAdmin") {
        baseSql += " AND sd.gender = 'FEMALE'";
      }

      if (filterStatus) {
        baseSql += " AND pr.status = ?";
        params.push(filterStatus);
      }

      if (fromDate && toDate) {
        baseSql += " AND DATE(pr.created_at) BETWEEN ? AND ?";
        params.push(fromDate, toDate);
      }

      baseSql += " ORDER BY pr.created_at DESC LIMIT 100";

      connection.query(baseSql, params, function (err, requests) {
        // Get statistics
        let statsSql = `
          SELECT 
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'approved' AND DATE(approved_at) = CURDATE() THEN 1 END) as approved,
            COUNT(CASE WHEN status = 'rejected' AND DATE(approved_at) = CURDATE() THEN 1 END) as rejected,
            COUNT(*) as total
          FROM pass_requests`;

        connection.query(statsSql, function (err, statsResult) {
          connection.release();

          res.render(__dirname + '/views/admin_passrequests', {
            requests: requests || [],
            stats: statsResult[0] || { pending: 0, approved: 0, rejected: 0, total: 0 },
            filterStatus: filterStatus,
            fromDate: fromDate,
            toDate: toDate,
            message: req.flash('message')
          });
        });
      });
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Session expired');
    return res.redirect('/loginpanel');
  }
});

// Admin - Approve Pass Request
app.post('/admin/approverequest/:id', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    const adminName = decode.adminname;
    const requestId = req.params.id;

    dbbconnection.getConnection(function (err, connection) {
      if (err) {
        req.flash('message', 'Database error');
        return res.redirect('/admin/passrequests');
      }

      // Get request details
      var getRequestSql = "SELECT * FROM pass_requests WHERE requestid = ? AND status = 'pending'";
      connection.query(getRequestSql, [requestId], function (err, requestResult) {
        if (err || requestResult.length === 0) {
          connection.release();
          req.flash('message', 'Request not found or already processed');
          return res.redirect('/admin/passrequests');
        }

        const request = requestResult[0];

        // Update request status
        var updateSql = "UPDATE pass_requests SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE requestid = ?";
        connection.query(updateSql, [adminName, requestId], function (err, updateResult) {
          if (err) {
            connection.release();
            req.flash('message', 'Error approving request');
            return res.redirect('/admin/passrequests');
          }

          // Create the actual pass in log_details1
          var createPassSql = `
            INSERT INTO log_details1 (uid, status, approvaldt, passtype, hosteloutauth) 
            VALUES (?, 'ACTIVE', NOW(), ?, ?)`;
          
          connection.query(createPassSql, [request.uid, request.passtype, adminName], function (err, passResult) {
            // Add notification for student
            var notifSql = `
              INSERT INTO student_notifications (uid, type, title, message, created_at) 
              VALUES (?, 'pass_approved', 'Pass Request Approved', ?, NOW())`;
            var notifMsg = `Your ${request.passtype} request has been approved by ${adminName}. Please collect your pass from the hostel office.`;
            
            connection.query(notifSql, [request.uid, notifMsg], function (err, notifResult) {
              connection.release();
              req.flash('message', 'Pass request approved and pass generated successfully');
              res.redirect('/admin/passrequests');
            });
          });
        });
      });
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Session expired');
    return res.redirect('/loginpanel');
  }
});

// Admin - Reject Pass Request
app.post('/admin/rejectrequest/:id', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    const adminName = decode.adminname;
    const requestId = req.params.id;
    const rejectionReason = req.body.reason || 'No reason provided';

    dbbconnection.getConnection(function (err, connection) {
      if (err) {
        req.flash('message', 'Database error');
        return res.redirect('/admin/passrequests');
      }

      // Get request details for notification
      var getRequestSql = "SELECT * FROM pass_requests WHERE requestid = ? AND status = 'pending'";
      connection.query(getRequestSql, [requestId], function (err, requestResult) {
        if (err || requestResult.length === 0) {
          connection.release();
          req.flash('message', 'Request not found or already processed');
          return res.redirect('/admin/passrequests');
        }

        const request = requestResult[0];

        // Update request status
        var updateSql = "UPDATE pass_requests SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ? WHERE requestid = ?";
        connection.query(updateSql, [adminName, rejectionReason, requestId], function (err, updateResult) {
          if (err) {
            connection.release();
            req.flash('message', 'Error rejecting request');
            return res.redirect('/admin/passrequests');
          }

          // Add notification for student
          var notifSql = `
            INSERT INTO student_notifications (uid, type, title, message, created_at) 
            VALUES (?, 'pass_rejected', 'Pass Request Rejected', ?, NOW())`;
          var notifMsg = `Your ${request.passtype} request has been rejected. Reason: ${rejectionReason}`;
          
          connection.query(notifSql, [request.uid, notifMsg], function (err, notifResult) {
            connection.release();
            req.flash('message', 'Pass request rejected');
            res.redirect('/admin/passrequests');
          });
        });
      });
    });
  } catch (err) {
    res.clearCookie("jwt");
    req.flash('message', 'Session expired');
    return res.redirect('/loginpanel');
  }
});

// =====================================================
// ADMIN - ROOM BOOKING MANAGEMENT
// =====================================================

// Admin - Get All Room Bookings
app.get('/api/admin/bookings', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    const role = decode.role;

    // Only SuperID or Hostel authority can view all bookings
    if (role !== "SuperID" && role !== "BoysHostelAdmin") {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    dbbconnection.getConnection(function (err, connection) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      const sql = `
        SELECT 
            b.id AS booking_id,
            b.booking_date,
            b.total_price,
            b.status AS booking_status,
            b.payment_status,
            b.created_at AS booking_created_at,
            r.name AS room_name,
            r.block,
            r.floor,
            r.room_type,
            sd.uid AS student_uid,
            sd.sname AS student_name,
            sd.mobileno AS student_mobile
        FROM 
            bookings b
        JOIN 
            rooms r ON b.room_id = r.id
        JOIN 
            studentdetails sd ON b.student_id = sd.uid
        ORDER BY 
            b.created_at DESC
      `;

      connection.query(sql, function (err, results) {
        connection.release();
        if (err) {
          console.error('Error fetching admin bookings:', err);
          return res.status(500).json({ message: 'Error fetching bookings' });
        }
        res.json(results);
      });
    });
  } catch (err) {
    res.clearCookie("jwt");
    return res.status(401).json({ message: 'Session expired or unauthorized' });
  }
});

// Admin - Confirm Payment for a Booking
app.post('/api/admin/bookings/:id/confirm_payment', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    const adminName = decode.adminname;
    const bookingId = req.params.id;

    // Only SuperID or Hostel authority can confirm payment
    if (decode.role !== "SuperID" && decode.role !== "Hostelauthority") {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    dbbconnection.getConnection(function (err, connection) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      const updateSql = "UPDATE bookings SET payment_status = 'paid' WHERE id = ? AND payment_status = 'pending'";
      connection.query(updateSql, [bookingId], function (err, result) {
        connection.release();
        if (err) {
          console.error('Error confirming payment:', err);
          return res.status(500).json({ message: 'Error confirming payment' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Booking not found or payment already confirmed' });
        }
        res.json({ message: 'Payment confirmed successfully' });
      });
    });
  } catch (err) {
    res.clearCookie("jwt");
    return res.status(401).json({ message: 'Session expired or unauthorized' });
  }
});

// Admin - Approve a Booking
app.post('/api/admin/bookings/:id/approve', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    const adminName = decode.adminname;
    const bookingId = req.params.id;

    // Only SuperID or Hostel authority can approve bookings
    if (decode.role !== "SuperID" && decode.role !== "Hostelauthority") {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    dbbconnection.getConnection(function (err, connection) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Ensure payment is paid before approving
      const checkPaymentSql = "SELECT payment_status, student_id, room_id, booking_date FROM bookings WHERE id = ?";
      connection.query(checkPaymentSql, [bookingId], function(err, bookingInfo) {
        if (err || bookingInfo.length === 0) {
          connection.release();
          return res.status(404).json({ message: 'Booking not found' });
        }

        if (bookingInfo[0].payment_status !== 'paid') {
          connection.release();
          return res.status(400).json({ message: 'Payment not confirmed for this booking' });
        }

        const studentUid = bookingInfo[0].student_id;
        const roomId = bookingInfo[0].room_id;
        const bookingDate = bookingInfo[0].booking_date;

        // Update booking status to confirmed
        const updateSql = "UPDATE bookings SET status = 'confirmed' WHERE id = ? AND status = 'on_hold'";
        connection.query(updateSql, [bookingId], function (err, result) {
          if (err) {
            connection.release();
            console.error('Error approving booking:', err);
            return res.status(500).json({ message: 'Error approving booking' });
          }
          if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: 'Booking not found or already approved/cancelled' });
          }

          // Add notification for student
          const notifMsg = `Your room booking for room ${roomId} on ${bookingDate.toLocaleDateString()} has been confirmed!`;
          const notifSql = "INSERT INTO student_notifications (uid, type, title, message, created_at) VALUES (?, ?, ?, ?, NOW())";
          connection.query(notifSql, [studentUid, 'room_booking_confirmed', 'Room Booking Confirmed', notifMsg], function(err, notifResult) {
            connection.release();
            if (err) {
              console.error('Error sending notification:', err);
            }
            res.json({ message: 'Booking approved successfully' });
          });
        });
      });
    });
  } catch (err) {
    res.clearCookie("jwt");
    return res.status(401).json({ message: 'Session expired or unauthorized' });
  }
});

// Admin - Reject/Cancel a Booking
app.post('/api/admin/bookings/:id/reject', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
    const decode = jwt.verify(tokenadmin, secretkey);
    const adminName = decode.adminname;
    const bookingId = req.params.id;
    const rejectionReason = req.body.reason || 'No reason provided';

    // Only SuperID or Hostel authority can reject/cancel bookings
    if (decode.role !== "SuperID" && decode.role !== "Hostelauthority") {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    dbbconnection.getConnection(function (err, connection) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Update booking status to cancelled
      const updateSql = "UPDATE bookings SET status = 'cancelled', rejection_reason = ? WHERE id = ? AND status IN ('pending', 'on_hold', 'confirmed')";
      connection.query(updateSql, [rejectionReason, bookingId], function (err, result) {
        if (err) {
          connection.release();
          console.error('Error rejecting booking:', err);
          return res.status(500).json({ message: 'Error rejecting booking' });
        }
        if (result.affectedRows === 0) {
          connection.release();
          return res.status(404).json({ message: 'Booking not found or already cancelled' });
        }

        // Get student UID for notification
        const getStudentSql = "SELECT student_id, room_id, booking_date FROM bookings WHERE id = ?";
        connection.query(getStudentSql, [bookingId], function(err, bookingInfo) {
          connection.release();
          if (err || bookingInfo.length === 0) {
            console.error('Error fetching student ID for notification:', err);
            return res.json({ message: 'Booking rejected, but notification failed' });
          }
          const studentUid = bookingInfo[0].student_id;
          const roomId = bookingInfo[0].room_id;
          const bookingDate = bookingInfo[0].booking_date;

          // Add notification for student
          const notifMsg = `Your room booking for room ${roomId} on ${bookingDate.toLocaleDateString()} has been rejected. Reason: ${rejectionReason}`; // Use `roomId` instead of `room_name`
          const notifSql = "INSERT INTO student_notifications (uid, type, title, message, created_at) VALUES (?, ?, ?, ?, NOW())";
          connection.query(notifSql, [studentUid, 'room_booking_rejected', 'Room Booking Rejected', notifMsg], function(err, notifResult) {
            if (err) {
              console.error('Error sending notification:', err);
            }
            res.json({ message: 'Booking rejected successfully' });
          });
        });
      });
    });
  } catch (err) {
    res.clearCookie("jwt");
    return res.status(401).json({ message: 'Session expired or unauthorized' });
  }
});



// =============================================================
// START: ATTENDANCE MODULE (Copy to bottom of app.js)
// =============================================================

// 1. SHOW ATTENDANCE PAGE (GET)
// This fixes the "Cannot GET /attendance" error
app.get('/attendance', verifyjwt, function (req, res) {
  const tokenadmin = req.cookies.jwt;
  try {
      const decode = jwt.verify(tokenadmin, secretkey);
      const role = decode.role;

      // Security Check
      if (["SuperID", "BoysHostelAdmin", "GirlsHostelAdmin", "Hostelauthority"].includes(role)) {
          
          dbbconnection.getConnection(function (err, connection) {
              if (err) { console.error("DB Connection Error:", err); return res.redirect('/loginpanel'); }

              // 1. Fetch Students & Their Status
              let sqlStudents = `
                  SELECT s.*, IFNULL(d.status, 'Pending') as today_status 
                  FROM studentdetails s 
                  LEFT JOIN daily_attendance d ON s.uid = d.uid AND d.date = CURDATE()
                  WHERE s.category='Hostel'
              `;

              if (role === "BoysHostelAdmin") sqlStudents += " AND s.gender='MALE'";
              else if (role === "GirlsHostelAdmin") sqlStudents += " AND s.gender='FEMALE'";
              
              sqlStudents += " ORDER BY s.room_no ASC, s.bed_no ASC";

              // 2. Fetch Dashboard Statistics
              let sqlStats = `
                  SELECT 
                      COUNT(*) as Total,
                      SUM(CASE WHEN d.status = 'Present' THEN 1 ELSE 0 END) as InHostel,
                      SUM(CASE WHEN d.status = 'Absent' THEN 1 ELSE 0 END) as AtCollege,
                      SUM(CASE WHEN d.status = 'Sick' THEN 1 ELSE 0 END) as Sick
                  FROM studentdetails s
                  LEFT JOIN daily_attendance d ON s.uid = d.uid AND d.date = CURDATE()
                  WHERE s.category='Hostel'
              `;
              
              if (role === "BoysHostelAdmin") sqlStats += " AND s.gender='MALE'";
              else if (role === "GirlsHostelAdmin") sqlStats += " AND s.gender='FEMALE'";

              // Execute Queries
              connection.query(sqlStudents, function (err, resultStudents) {
                  if (err) { connection.release(); console.error(err); return; }

                  connection.query(sqlStats, function (err, resultStats) {
                      connection.release();
                      
                      // Render Page
                      res.render(__dirname + '/views/attendance', { 
                          serverData: resultStudents,
                          stats: resultStats[0], 
                          role: role,
                          message: req.flash('message')
                      });
                  });
              });
          });
      } else {
          req.flash('message', 'Unauthorised Access');
          res.redirect('/loginpanel');
      }
  } catch (err) {
      res.clearCookie("jwt");
      return res.redirect('/loginpanel');
  }
});

// 2. SAVE ATTENDANCE (POST)
// This fixes the "Server returned 404" or "Connection Failed" error
app.post('/api/mark-attendance', verifyjwt, (req, res) => {
  const { uid, status } = req.body;
  
  if(!uid || !status) {
      return res.status(400).json({ success: false, message: "Missing Data" });
  }

  try {
      const tokenadmin = req.cookies.jwt;
      const decode = jwt.verify(tokenadmin, secretkey);
      const markedBy = decode.adminname || 'Admin';

      dbbconnection.getConnection((err, connection) => {
          if (err) return res.status(500).json({ success: false, message: "DB Error" });

          const checkSql = "SELECT * FROM daily_attendance WHERE uid=? AND date=CURDATE()";
          
          connection.query(checkSql, [uid], (err, result) => {
              if (err) { connection.release(); return res.status(500).json({ success: false }); }

              if(result.length > 0) {
                  // Update existing
                  const updateSql = "UPDATE daily_attendance SET status=?, marked_by=? WHERE uid=? AND date=CURDATE()";
                  connection.query(updateSql, [status, markedBy, uid], (err) => {
                      connection.release();
                      res.json({ success: true });
                  });
              } else {
                  // Insert new
                  const insertSql = "INSERT INTO daily_attendance (uid, date, status, marked_by) VALUES (?, CURDATE(), ?, ?)";
                  connection.query(insertSql, [uid, status, markedBy], (err) => {
                      connection.release();
                      res.json({ success: true });
                  });
              }
          });
      });
  } catch(e) {
      return res.status(401).json({ success: false, message: "Auth Error" });
  }
});

// =============================================================
// END: ATTENDANCE MODULE
// =============================================================
// ==========================================
// 1. GLOBAL ANALYTICS DASHBOARD (REMOVING STATUS, ADDING BLOCK BREAKDOWN)
// ==========================================
app.get('/analytics/global', verifyjwt, async function (req, res) {
  try {
      const tokenadmin = req.cookies.jwt;
      const decode = jwt.verify(tokenadmin, secretkey);
      const role = decode.role;

      dbbconnection.getConnection((err, connection) => {
          if (err) { console.error("DB Connection Error:", err); return res.redirect('/loginpanel'); }

          // Query 1: Today's Attendance Counts (Present/Absent/Homepass)
          const sqlAttendance = `
              SELECT 
                  COUNT(s.uid) as Total,
                  SUM(CASE WHEN d.status = 'Present' THEN 1 ELSE 0 END) as Present,
                  SUM(CASE WHEN d.status = 'Absent' THEN 1 ELSE 0 END) as Absent,
                  SUM(CASE WHEN d.status = 'Home' THEN 1 ELSE 0 END) as Home
              FROM studentdetails s
              LEFT JOIN daily_attendance d ON s.uid = d.uid AND d.date = CURDATE()
              WHERE s.category='Hostel'`;

          // Query 2: Mess Utilization (Veg vs Non-Veg)
          const sqlMess = `
              SELECT mess_type, COUNT(*) as count 
              FROM studentdetails WHERE category='Hostel' GROUP BY mess_type`;

          // NEW Query 3: Student Breakdown by Block
          const sqlBlock = `
              SELECT block, COUNT(*) as count 
              FROM studentdetails WHERE category='Hostel' GROUP BY block ORDER BY block ASC`;
          
          // Query 4: Breakdown by Academic Year
          const sqlYear = `
              SELECT year, COUNT(*) as count 
              FROM studentdetails WHERE category='Hostel' GROUP BY year ORDER BY year ASC`;


          // Execute all queries in sequence
          connection.query(sqlAttendance, (err, resAttendance) => {
              if(err) { connection.release(); console.error(err); return res.status(500).send("DB Error"); }
              
              connection.query(sqlMess, (err, resMess) => {
                  if(err) { connection.release(); console.error(err); return res.status(500).send("DB Error"); }

                  connection.query(sqlBlock, (err, resBlock) => {
                      if(err) { connection.release(); console.error(err); return res.status(500).send("DB Error"); }

                      connection.query(sqlYear, (err, resYear) => {
                          connection.release();
                          if(err) { console.error(err); return res.status(500).send("DB Error"); }

                          const stats = {
                              attendance: resAttendance[0],
                              mess: resMess,
                              block: resBlock, // NEW DATA
                              year: resYear
                          };

                          res.render(__dirname + '/views/analytics', { 
                              stats: stats, 
                              role: role, 
                              message: req.flash('message') 
                          });
                      });
                  });
              });
          });
      });
  } catch (err) {
      console.error("Auth/Token Error:", err);
      res.redirect('/loginpanel');
  }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port ", PORT);

});
//process.env.PORT
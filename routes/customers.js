var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET Customer page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM customer",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("customer/list", {
          title: "Customers",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var customer = {
        id: req.params.id,
      };

      var delete_sql = "delete from customer where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/customers");
            } else {
              req.flash("msg_info", "Berhasil Menghapus Member");
              res.redirect("/customers");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM customer where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/customers");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Member tidak ditemukan!");
              res.redirect("/customers");
            } else {
              console.log(rows);
              res.render("customer/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("nama", "Tolong harap diisi").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_nama = req.sanitize("nama").escape().trim();
      v_alamat = req.sanitize("alamat").escape().trim();
      v_no_hp = req.sanitize("no_hp").escape().trim();
      v_tanggal_masuk = req.sanitize("tanggal_masuk").escape();

      if (!req.files) {
        var customer = {
          nama: v_nama,
          alamat: v_alamat,
          no_hp: v_no_hp,
          tanggal_masuk: v_tanggal_masuk,
        };
      } else {
        var file = req.files.gambar;
        file.mimetype == "image/jpeg" || "image/png";
        file.mv("public/images/upload/" + file.name);

        var customer = {
          nama: v_nama,
          alamat: v_alamat,
          no_hp: v_no_hp,
          tanggal_masuk: v_tanggal_masuk,
          gambar: file.name,
        };
      };

      var update_sql = "update customer SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("customer/edit", {
                nama: req.param("nama"),
                alamat: req.param("alamat"),
                no_hp: req.param("no_hp"),
                tanggal_masuk: req.param("tanggal_masuk"),
              });
            } else {
              req.flash("msg_info", "Berhasil Memperbarui data");
              res.redirect("/customers/edit/" + req.params.id);
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/customers/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("nama", "Please fill the nama").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_nama = req.sanitize("nama").escape().trim();
    v_alamat = req.sanitize("alamat").escape().trim();
    v_no_hp = req.sanitize("no_hp").escape().trim();
    v_tanggal_masuk = req.sanitize("tanggal_masuk").escape();

    var file = req.files.gambar;
    file.mimetype == "image/jpeg" || "image/png";
    file.mv("public/images/upload/" + file.name);

    var customer = {
      nama: v_nama,
      alamat: v_alamat,
      no_hp: v_no_hp,
      tanggal_masuk: v_tanggal_masuk,
      gambar: file.name,
    };

    var insert_sql = "INSERT INTO customer SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        customer,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("customer/add-customer", {
              nama: req.param("nama"),
              alamat: req.param("alamat"),
              no_hp: req.param("no_hp"),
              tanggal_masuk: req.param("tanggal_masuk"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Berhasil Menambah Member");
            res.redirect("/customers");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sorry there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("customer/add-customer", {
      nama: req.param("nama"),
      alamat: req.param("alamat"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("customer/add-customer", {
    title: "Add New Customer",
    nama: "",
    alamat: "",
    no_hp: "",
    tanggal_masuk: "",
    gambar: "",
    session_store: req.session,
  });
});

module.exports = router;

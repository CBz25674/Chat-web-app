module.exports = (req, res) => {
    //ลบ session ที่เก็บไว้ทั้งหมด
    req.session.destroy((err) => {
        if (err) throw err;
    });
    res.redirect("/login");
}
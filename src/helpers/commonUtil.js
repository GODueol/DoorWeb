/**
 * Created by gimbyeongjin on 2018. 5. 31..
 */
export default {
  OneYear : 60*60*24*365,
  isRelease(date) {
    return date <= (new Date).getTime();
  },
  getBorder(date){
    if(this.isOneYear(date)) return "border-warning";
    if(this.isRelease(date)) return "border-success";
    return "border-danger";
  },
  isOneYear(date) {
    return (new Date).getTime() - date >= this.OneYear; // 1년
  },
  detailImg(url) {
    console.log("dsadsad")
    let img1 = new Image();
    img1.src = (url);
    if ((img1.width != 0) && (img1.height != 0)) {
      let W = img1.width;
      let H = img1.height;
      let O = "width=" + W + ",height=" + H + ",scrollbars=yes";
      let imgWin = window.open("", "", O);
      imgWin.document.write("<html><head><title>:*:*:*: 이미지상세보기 :*:*:*:*:*:*:</title></head>");
      imgWin.document.write("<body topmargin=0 leftmargin=0>");
      imgWin.document.write("<img src=" + url + " onclick='self.close()' style='cursor:pointer;' title ='클릭하시면 창이 닫힙니다.'>");
      imgWin.document.close();

    }
    else {
      let controller = "imgControll('" + url + "')";
      intervalID = setTimeout(controller, 20);
    }
  }
}

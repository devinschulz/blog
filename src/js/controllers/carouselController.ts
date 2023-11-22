import { Controller } from "@hotwired/stimulus";
import Flickity from "flickity";
import "flickity/css/flickity.css";

export default class CarouselController extends Controller {
  connect() {
    new Flickity(this.element, {
      cellAlign: "center",
      wrapAround: true,
      prevNextButtons: false,
    });
  }
}

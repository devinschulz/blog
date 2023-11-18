import { Controller } from "@hotwired/stimulus";
import gsap from "gsap";
import { useClickOutside } from "stimulus-use";

export default class MobileNavController extends Controller {
  declare tl: gsap.core.Timeline;
  declare readonly triggerTarget: HTMLButtonElement;
  declare readonly navTarget: HTMLElement;
  declare readonly pageTarget: HTMLDivElement;
  declare readonly overlayTarget: HTMLDivElement;
  declare readonly linkTargets: HTMLLIElement[];
  declare readonly barTargets: HTMLDivElement[];

  private isOpen = false;

  static targets = ["trigger", "nav", "link", "overlay", "page"];

  connect() {
    useClickOutside(this, {
      element: this.navTarget,
    });

    this.tl = gsap.timeline({
      defaults: {
        duration: 0.2,
      },
      paused: true,
    });

    this.tl.to(this.pageTarget, {
      x: 200,
      scale: 0.8,
      borderRadius: 12,
      opacity: 0.8,
    });

    this.tl.to(
      this.overlayTarget,
      {
        x: 0,
        opacity: 1,
        stagger: 0.1,
        ease: "sine.out",
      },
      0.2,
    );

    this.tl.to(this.linkTargets, {
      duration: 0.25,
      x: 0,
      opacity: 1,
      stagger: 0.1,
      ease: "sine.out",
    });
  }

  clickOutside(event: PointerEvent) {
    const target = event.target as HTMLElement;
    if (
      this.triggerTarget.contains(target) ||
      this.navTarget.contains(target)
    ) {
      event.preventDefault();
      return false;
    }

    if (this.isOpen) {
      this.close();
    }
  }

  open() {
    this.isOpen = true;
    this.playAnimation();
  }

  close() {
    this.isOpen = false;
    this.closeAnimation();
  }

  playAnimation() {
    this.tl.timeScale(1).play();
  }

  closeAnimation() {
    this.tl.timeScale(2).reverse();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}

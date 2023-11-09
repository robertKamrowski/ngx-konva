import { AfterContentInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, SkipSelf } from '@angular/core';
import { KoStageComponent } from './ko-stage.component';

@Component({
  selector: 'ko-stage-autoscale',
  template: `
      <ng-content></ng-content>
  `,
  styles: [``],
  providers: [{
    provide: KoStageComponent,
    useExisting: KoStageAutoScaleComponent
  }]
})
export class KoStageAutoScaleComponent extends KoStageComponent implements OnInit, OnDestroy, AfterContentInit {
  private initialDimensions: { width: number, height: number } | null = null;
  private resizeObserver = new ResizeObserver(this.onResize.bind(this));

  @Output()
  initDimensions = new EventEmitter<{ width: number, height: number }>();

  constructor(
    @SkipSelf() private parentContainer: ElementRef<HTMLDivElement>,
    private cdRef: ChangeDetectorRef,
  ) {
    super(parentContainer);
    if (!parentContainer) {
      throw new Error(
        'ko-stage-autoscale should be nested inside a div/element!'
      );
    }

    this.config = {
      container: parentContainer.nativeElement,
      width: 0,
      height: 0
    }

    this.resizeObserver.observe(this.parentContainer.nativeElement);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  ngAfterContentInit(): void {
    this.scaleStage();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.resizeObserver.disconnect();
  }

  private onResize() {
    this.scaleStage();
  }

  private scaleStage() {
    const { width, height } = this.parentContainer.nativeElement.getBoundingClientRect();

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      return;
    } else if (!this.initialDimensions) {
      this.initialDimensions = this.parentContainer.nativeElement.getBoundingClientRect();
      this.initDimensions.emit(this.initialDimensions!);
    }

    const scaleWidth = width / this.initialDimensions.width;
    const scaleHeight = height / this.initialDimensions.height;

    this.config = {
      container: this.parentContainer.nativeElement,
      width,
      height,
      scaleX: scaleWidth,
      scaleY: scaleHeight
    }
    this.afterUpdate.emit(this.stage);
    this.cdRef.detectChanges();
  }

}

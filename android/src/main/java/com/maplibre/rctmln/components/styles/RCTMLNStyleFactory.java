// DO NOT MODIFY
// This file is auto-generated from scripts/templates/RCTMLNStyleFactory.java.ejs

package com.maplibre.rctmln.components.styles;

import org.maplibre.android.style.layers.BackgroundLayer;
import org.maplibre.android.style.layers.CircleLayer;
import org.maplibre.android.style.layers.FillExtrusionLayer;
import org.maplibre.android.style.layers.FillLayer;
import org.maplibre.android.style.layers.LineLayer;
import org.maplibre.android.style.layers.PropertyFactory;
import org.maplibre.android.style.layers.PropertyValue;
import org.maplibre.android.style.layers.RasterLayer;
import org.maplibre.android.style.layers.SymbolLayer;
import org.maplibre.android.style.layers.HeatmapLayer;
import org.maplibre.android.style.layers.HillshadeLayer;
import org.maplibre.android.style.layers.TransitionOptions;
import org.maplibre.android.style.light.Light;
import org.maplibre.android.style.light.Position;
import com.maplibre.rctmln.utils.DownloadMapImageTask;

import java.util.List;

public class RCTMLNStyleFactory {
    public static final String VALUE_KEY = "value";
    public static final String SHOULD_ADD_IMAGE_KEY = "shouldAddImage";

    public static void setFillLayerStyle(final FillLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "fillSortKey":
              RCTMLNStyleFactory.setFillSortKey(layer, styleValue);
              break;
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "fillAntialias":
              RCTMLNStyleFactory.setFillAntialias(layer, styleValue);
              break;
            case "fillOpacity":
              RCTMLNStyleFactory.setFillOpacity(layer, styleValue);
              break;
            case "fillOpacityTransition":
              RCTMLNStyleFactory.setFillOpacityTransition(layer, styleValue);
              break;
            case "fillColor":
              RCTMLNStyleFactory.setFillColor(layer, styleValue);
              break;
            case "fillColorTransition":
              RCTMLNStyleFactory.setFillColorTransition(layer, styleValue);
              break;
            case "fillOutlineColor":
              RCTMLNStyleFactory.setFillOutlineColor(layer, styleValue);
              break;
            case "fillOutlineColorTransition":
              RCTMLNStyleFactory.setFillOutlineColorTransition(layer, styleValue);
              break;
            case "fillTranslate":
              RCTMLNStyleFactory.setFillTranslate(layer, styleValue);
              break;
            case "fillTranslateTransition":
              RCTMLNStyleFactory.setFillTranslateTransition(layer, styleValue);
              break;
            case "fillTranslateAnchor":
              RCTMLNStyleFactory.setFillTranslateAnchor(layer, styleValue);
              break;
            case "fillPattern":
              style.addImage(styleValue, new DownloadMapImageTask.OnAllImagesLoaded() {
                  @Override
                  public void onAllImagesLoaded() {
                      RCTMLNStyleFactory.setFillPattern(layer, styleValue);
                  }
              });
              break;
            case "fillPatternTransition":
              RCTMLNStyleFactory.setFillPatternTransition(layer, styleValue);
              break;
        }
      }
    }
    public static void setLineLayerStyle(final LineLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "lineCap":
              RCTMLNStyleFactory.setLineCap(layer, styleValue);
              break;
            case "lineJoin":
              RCTMLNStyleFactory.setLineJoin(layer, styleValue);
              break;
            case "lineMiterLimit":
              RCTMLNStyleFactory.setLineMiterLimit(layer, styleValue);
              break;
            case "lineRoundLimit":
              RCTMLNStyleFactory.setLineRoundLimit(layer, styleValue);
              break;
            case "lineSortKey":
              RCTMLNStyleFactory.setLineSortKey(layer, styleValue);
              break;
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "lineOpacity":
              RCTMLNStyleFactory.setLineOpacity(layer, styleValue);
              break;
            case "lineOpacityTransition":
              RCTMLNStyleFactory.setLineOpacityTransition(layer, styleValue);
              break;
            case "lineColor":
              RCTMLNStyleFactory.setLineColor(layer, styleValue);
              break;
            case "lineColorTransition":
              RCTMLNStyleFactory.setLineColorTransition(layer, styleValue);
              break;
            case "lineTranslate":
              RCTMLNStyleFactory.setLineTranslate(layer, styleValue);
              break;
            case "lineTranslateTransition":
              RCTMLNStyleFactory.setLineTranslateTransition(layer, styleValue);
              break;
            case "lineTranslateAnchor":
              RCTMLNStyleFactory.setLineTranslateAnchor(layer, styleValue);
              break;
            case "lineWidth":
              RCTMLNStyleFactory.setLineWidth(layer, styleValue);
              break;
            case "lineWidthTransition":
              RCTMLNStyleFactory.setLineWidthTransition(layer, styleValue);
              break;
            case "lineGapWidth":
              RCTMLNStyleFactory.setLineGapWidth(layer, styleValue);
              break;
            case "lineGapWidthTransition":
              RCTMLNStyleFactory.setLineGapWidthTransition(layer, styleValue);
              break;
            case "lineOffset":
              RCTMLNStyleFactory.setLineOffset(layer, styleValue);
              break;
            case "lineOffsetTransition":
              RCTMLNStyleFactory.setLineOffsetTransition(layer, styleValue);
              break;
            case "lineBlur":
              RCTMLNStyleFactory.setLineBlur(layer, styleValue);
              break;
            case "lineBlurTransition":
              RCTMLNStyleFactory.setLineBlurTransition(layer, styleValue);
              break;
            case "lineDasharray":
              RCTMLNStyleFactory.setLineDasharray(layer, styleValue);
              break;
            case "lineDasharrayTransition":
              RCTMLNStyleFactory.setLineDasharrayTransition(layer, styleValue);
              break;
            case "linePattern":
              style.addImage(styleValue, new DownloadMapImageTask.OnAllImagesLoaded() {
                  @Override
                  public void onAllImagesLoaded() {
                      RCTMLNStyleFactory.setLinePattern(layer, styleValue);
                  }
              });
              break;
            case "linePatternTransition":
              RCTMLNStyleFactory.setLinePatternTransition(layer, styleValue);
              break;
            case "lineGradient":
              RCTMLNStyleFactory.setLineGradient(layer, styleValue);
              break;
        }
      }
    }
    public static void setSymbolLayerStyle(final SymbolLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "symbolPlacement":
              RCTMLNStyleFactory.setSymbolPlacement(layer, styleValue);
              break;
            case "symbolSpacing":
              RCTMLNStyleFactory.setSymbolSpacing(layer, styleValue);
              break;
            case "symbolAvoidEdges":
              RCTMLNStyleFactory.setSymbolAvoidEdges(layer, styleValue);
              break;
            case "symbolSortKey":
              RCTMLNStyleFactory.setSymbolSortKey(layer, styleValue);
              break;
            case "symbolZOrder":
              RCTMLNStyleFactory.setSymbolZOrder(layer, styleValue);
              break;
            case "iconAllowOverlap":
              RCTMLNStyleFactory.setIconAllowOverlap(layer, styleValue);
              break;
            case "iconIgnorePlacement":
              RCTMLNStyleFactory.setIconIgnorePlacement(layer, styleValue);
              break;
            case "iconOptional":
              RCTMLNStyleFactory.setIconOptional(layer, styleValue);
              break;
            case "iconRotationAlignment":
              RCTMLNStyleFactory.setIconRotationAlignment(layer, styleValue);
              break;
            case "iconSize":
              RCTMLNStyleFactory.setIconSize(layer, styleValue);
              break;
            case "iconTextFit":
              RCTMLNStyleFactory.setIconTextFit(layer, styleValue);
              break;
            case "iconTextFitPadding":
              RCTMLNStyleFactory.setIconTextFitPadding(layer, styleValue);
              break;
            case "iconImage":
              style.addImage(styleValue, new DownloadMapImageTask.OnAllImagesLoaded() {
                  @Override
                  public void onAllImagesLoaded() {
                      RCTMLNStyleFactory.setIconImage(layer, styleValue);
                  }
              });
              break;
            case "iconRotate":
              RCTMLNStyleFactory.setIconRotate(layer, styleValue);
              break;
            case "iconPadding":
              RCTMLNStyleFactory.setIconPadding(layer, styleValue);
              break;
            case "iconKeepUpright":
              RCTMLNStyleFactory.setIconKeepUpright(layer, styleValue);
              break;
            case "iconOffset":
              RCTMLNStyleFactory.setIconOffset(layer, styleValue);
              break;
            case "iconAnchor":
              RCTMLNStyleFactory.setIconAnchor(layer, styleValue);
              break;
            case "iconPitchAlignment":
              RCTMLNStyleFactory.setIconPitchAlignment(layer, styleValue);
              break;
            case "textPitchAlignment":
              RCTMLNStyleFactory.setTextPitchAlignment(layer, styleValue);
              break;
            case "textRotationAlignment":
              RCTMLNStyleFactory.setTextRotationAlignment(layer, styleValue);
              break;
            case "textField":
              RCTMLNStyleFactory.setTextField(layer, styleValue);
              break;
            case "textFont":
              RCTMLNStyleFactory.setTextFont(layer, styleValue);
              break;
            case "textSize":
              RCTMLNStyleFactory.setTextSize(layer, styleValue);
              break;
            case "textMaxWidth":
              RCTMLNStyleFactory.setTextMaxWidth(layer, styleValue);
              break;
            case "textLineHeight":
              RCTMLNStyleFactory.setTextLineHeight(layer, styleValue);
              break;
            case "textLetterSpacing":
              RCTMLNStyleFactory.setTextLetterSpacing(layer, styleValue);
              break;
            case "textJustify":
              RCTMLNStyleFactory.setTextJustify(layer, styleValue);
              break;
            case "textRadialOffset":
              RCTMLNStyleFactory.setTextRadialOffset(layer, styleValue);
              break;
            case "textVariableAnchor":
              RCTMLNStyleFactory.setTextVariableAnchor(layer, styleValue);
              break;
            case "textAnchor":
              RCTMLNStyleFactory.setTextAnchor(layer, styleValue);
              break;
            case "textMaxAngle":
              RCTMLNStyleFactory.setTextMaxAngle(layer, styleValue);
              break;
            case "textWritingMode":
              RCTMLNStyleFactory.setTextWritingMode(layer, styleValue);
              break;
            case "textRotate":
              RCTMLNStyleFactory.setTextRotate(layer, styleValue);
              break;
            case "textPadding":
              RCTMLNStyleFactory.setTextPadding(layer, styleValue);
              break;
            case "textKeepUpright":
              RCTMLNStyleFactory.setTextKeepUpright(layer, styleValue);
              break;
            case "textTransform":
              RCTMLNStyleFactory.setTextTransform(layer, styleValue);
              break;
            case "textOffset":
              RCTMLNStyleFactory.setTextOffset(layer, styleValue);
              break;
            case "textAllowOverlap":
              RCTMLNStyleFactory.setTextAllowOverlap(layer, styleValue);
              break;
            case "textIgnorePlacement":
              RCTMLNStyleFactory.setTextIgnorePlacement(layer, styleValue);
              break;
            case "textOptional":
              RCTMLNStyleFactory.setTextOptional(layer, styleValue);
              break;
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "iconOpacity":
              RCTMLNStyleFactory.setIconOpacity(layer, styleValue);
              break;
            case "iconOpacityTransition":
              RCTMLNStyleFactory.setIconOpacityTransition(layer, styleValue);
              break;
            case "iconColor":
              RCTMLNStyleFactory.setIconColor(layer, styleValue);
              break;
            case "iconColorTransition":
              RCTMLNStyleFactory.setIconColorTransition(layer, styleValue);
              break;
            case "iconHaloColor":
              RCTMLNStyleFactory.setIconHaloColor(layer, styleValue);
              break;
            case "iconHaloColorTransition":
              RCTMLNStyleFactory.setIconHaloColorTransition(layer, styleValue);
              break;
            case "iconHaloWidth":
              RCTMLNStyleFactory.setIconHaloWidth(layer, styleValue);
              break;
            case "iconHaloWidthTransition":
              RCTMLNStyleFactory.setIconHaloWidthTransition(layer, styleValue);
              break;
            case "iconHaloBlur":
              RCTMLNStyleFactory.setIconHaloBlur(layer, styleValue);
              break;
            case "iconHaloBlurTransition":
              RCTMLNStyleFactory.setIconHaloBlurTransition(layer, styleValue);
              break;
            case "iconTranslate":
              RCTMLNStyleFactory.setIconTranslate(layer, styleValue);
              break;
            case "iconTranslateTransition":
              RCTMLNStyleFactory.setIconTranslateTransition(layer, styleValue);
              break;
            case "iconTranslateAnchor":
              RCTMLNStyleFactory.setIconTranslateAnchor(layer, styleValue);
              break;
            case "textOpacity":
              RCTMLNStyleFactory.setTextOpacity(layer, styleValue);
              break;
            case "textOpacityTransition":
              RCTMLNStyleFactory.setTextOpacityTransition(layer, styleValue);
              break;
            case "textColor":
              RCTMLNStyleFactory.setTextColor(layer, styleValue);
              break;
            case "textColorTransition":
              RCTMLNStyleFactory.setTextColorTransition(layer, styleValue);
              break;
            case "textHaloColor":
              RCTMLNStyleFactory.setTextHaloColor(layer, styleValue);
              break;
            case "textHaloColorTransition":
              RCTMLNStyleFactory.setTextHaloColorTransition(layer, styleValue);
              break;
            case "textHaloWidth":
              RCTMLNStyleFactory.setTextHaloWidth(layer, styleValue);
              break;
            case "textHaloWidthTransition":
              RCTMLNStyleFactory.setTextHaloWidthTransition(layer, styleValue);
              break;
            case "textHaloBlur":
              RCTMLNStyleFactory.setTextHaloBlur(layer, styleValue);
              break;
            case "textHaloBlurTransition":
              RCTMLNStyleFactory.setTextHaloBlurTransition(layer, styleValue);
              break;
            case "textTranslate":
              RCTMLNStyleFactory.setTextTranslate(layer, styleValue);
              break;
            case "textTranslateTransition":
              RCTMLNStyleFactory.setTextTranslateTransition(layer, styleValue);
              break;
            case "textTranslateAnchor":
              RCTMLNStyleFactory.setTextTranslateAnchor(layer, styleValue);
              break;
        }
      }
    }
    public static void setCircleLayerStyle(final CircleLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "circleSortKey":
              RCTMLNStyleFactory.setCircleSortKey(layer, styleValue);
              break;
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "circleRadius":
              RCTMLNStyleFactory.setCircleRadius(layer, styleValue);
              break;
            case "circleRadiusTransition":
              RCTMLNStyleFactory.setCircleRadiusTransition(layer, styleValue);
              break;
            case "circleColor":
              RCTMLNStyleFactory.setCircleColor(layer, styleValue);
              break;
            case "circleColorTransition":
              RCTMLNStyleFactory.setCircleColorTransition(layer, styleValue);
              break;
            case "circleBlur":
              RCTMLNStyleFactory.setCircleBlur(layer, styleValue);
              break;
            case "circleBlurTransition":
              RCTMLNStyleFactory.setCircleBlurTransition(layer, styleValue);
              break;
            case "circleOpacity":
              RCTMLNStyleFactory.setCircleOpacity(layer, styleValue);
              break;
            case "circleOpacityTransition":
              RCTMLNStyleFactory.setCircleOpacityTransition(layer, styleValue);
              break;
            case "circleTranslate":
              RCTMLNStyleFactory.setCircleTranslate(layer, styleValue);
              break;
            case "circleTranslateTransition":
              RCTMLNStyleFactory.setCircleTranslateTransition(layer, styleValue);
              break;
            case "circleTranslateAnchor":
              RCTMLNStyleFactory.setCircleTranslateAnchor(layer, styleValue);
              break;
            case "circlePitchScale":
              RCTMLNStyleFactory.setCirclePitchScale(layer, styleValue);
              break;
            case "circlePitchAlignment":
              RCTMLNStyleFactory.setCirclePitchAlignment(layer, styleValue);
              break;
            case "circleStrokeWidth":
              RCTMLNStyleFactory.setCircleStrokeWidth(layer, styleValue);
              break;
            case "circleStrokeWidthTransition":
              RCTMLNStyleFactory.setCircleStrokeWidthTransition(layer, styleValue);
              break;
            case "circleStrokeColor":
              RCTMLNStyleFactory.setCircleStrokeColor(layer, styleValue);
              break;
            case "circleStrokeColorTransition":
              RCTMLNStyleFactory.setCircleStrokeColorTransition(layer, styleValue);
              break;
            case "circleStrokeOpacity":
              RCTMLNStyleFactory.setCircleStrokeOpacity(layer, styleValue);
              break;
            case "circleStrokeOpacityTransition":
              RCTMLNStyleFactory.setCircleStrokeOpacityTransition(layer, styleValue);
              break;
        }
      }
    }
    public static void setHeatmapLayerStyle(final HeatmapLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "heatmapRadius":
              RCTMLNStyleFactory.setHeatmapRadius(layer, styleValue);
              break;
            case "heatmapRadiusTransition":
              RCTMLNStyleFactory.setHeatmapRadiusTransition(layer, styleValue);
              break;
            case "heatmapWeight":
              RCTMLNStyleFactory.setHeatmapWeight(layer, styleValue);
              break;
            case "heatmapIntensity":
              RCTMLNStyleFactory.setHeatmapIntensity(layer, styleValue);
              break;
            case "heatmapIntensityTransition":
              RCTMLNStyleFactory.setHeatmapIntensityTransition(layer, styleValue);
              break;
            case "heatmapColor":
              RCTMLNStyleFactory.setHeatmapColor(layer, styleValue);
              break;
            case "heatmapOpacity":
              RCTMLNStyleFactory.setHeatmapOpacity(layer, styleValue);
              break;
            case "heatmapOpacityTransition":
              RCTMLNStyleFactory.setHeatmapOpacityTransition(layer, styleValue);
              break;
        }
      }
    }
    public static void setFillExtrusionLayerStyle(final FillExtrusionLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "fillExtrusionOpacity":
              RCTMLNStyleFactory.setFillExtrusionOpacity(layer, styleValue);
              break;
            case "fillExtrusionOpacityTransition":
              RCTMLNStyleFactory.setFillExtrusionOpacityTransition(layer, styleValue);
              break;
            case "fillExtrusionColor":
              RCTMLNStyleFactory.setFillExtrusionColor(layer, styleValue);
              break;
            case "fillExtrusionColorTransition":
              RCTMLNStyleFactory.setFillExtrusionColorTransition(layer, styleValue);
              break;
            case "fillExtrusionTranslate":
              RCTMLNStyleFactory.setFillExtrusionTranslate(layer, styleValue);
              break;
            case "fillExtrusionTranslateTransition":
              RCTMLNStyleFactory.setFillExtrusionTranslateTransition(layer, styleValue);
              break;
            case "fillExtrusionTranslateAnchor":
              RCTMLNStyleFactory.setFillExtrusionTranslateAnchor(layer, styleValue);
              break;
            case "fillExtrusionPattern":
              style.addImage(styleValue, new DownloadMapImageTask.OnAllImagesLoaded() {
                  @Override
                  public void onAllImagesLoaded() {
                      RCTMLNStyleFactory.setFillExtrusionPattern(layer, styleValue);
                  }
              });
              break;
            case "fillExtrusionPatternTransition":
              RCTMLNStyleFactory.setFillExtrusionPatternTransition(layer, styleValue);
              break;
            case "fillExtrusionHeight":
              RCTMLNStyleFactory.setFillExtrusionHeight(layer, styleValue);
              break;
            case "fillExtrusionHeightTransition":
              RCTMLNStyleFactory.setFillExtrusionHeightTransition(layer, styleValue);
              break;
            case "fillExtrusionBase":
              RCTMLNStyleFactory.setFillExtrusionBase(layer, styleValue);
              break;
            case "fillExtrusionBaseTransition":
              RCTMLNStyleFactory.setFillExtrusionBaseTransition(layer, styleValue);
              break;
            case "fillExtrusionVerticalGradient":
              RCTMLNStyleFactory.setFillExtrusionVerticalGradient(layer, styleValue);
              break;
        }
      }
    }
    public static void setRasterLayerStyle(final RasterLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "rasterOpacity":
              RCTMLNStyleFactory.setRasterOpacity(layer, styleValue);
              break;
            case "rasterOpacityTransition":
              RCTMLNStyleFactory.setRasterOpacityTransition(layer, styleValue);
              break;
            case "rasterHueRotate":
              RCTMLNStyleFactory.setRasterHueRotate(layer, styleValue);
              break;
            case "rasterHueRotateTransition":
              RCTMLNStyleFactory.setRasterHueRotateTransition(layer, styleValue);
              break;
            case "rasterBrightnessMin":
              RCTMLNStyleFactory.setRasterBrightnessMin(layer, styleValue);
              break;
            case "rasterBrightnessMinTransition":
              RCTMLNStyleFactory.setRasterBrightnessMinTransition(layer, styleValue);
              break;
            case "rasterBrightnessMax":
              RCTMLNStyleFactory.setRasterBrightnessMax(layer, styleValue);
              break;
            case "rasterBrightnessMaxTransition":
              RCTMLNStyleFactory.setRasterBrightnessMaxTransition(layer, styleValue);
              break;
            case "rasterSaturation":
              RCTMLNStyleFactory.setRasterSaturation(layer, styleValue);
              break;
            case "rasterSaturationTransition":
              RCTMLNStyleFactory.setRasterSaturationTransition(layer, styleValue);
              break;
            case "rasterContrast":
              RCTMLNStyleFactory.setRasterContrast(layer, styleValue);
              break;
            case "rasterContrastTransition":
              RCTMLNStyleFactory.setRasterContrastTransition(layer, styleValue);
              break;
            case "rasterResampling":
              RCTMLNStyleFactory.setRasterResampling(layer, styleValue);
              break;
            case "rasterFadeDuration":
              RCTMLNStyleFactory.setRasterFadeDuration(layer, styleValue);
              break;
        }
      }
    }
    public static void setHillshadeLayerStyle(final HillshadeLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "hillshadeIlluminationDirection":
              RCTMLNStyleFactory.setHillshadeIlluminationDirection(layer, styleValue);
              break;
            case "hillshadeIlluminationAnchor":
              RCTMLNStyleFactory.setHillshadeIlluminationAnchor(layer, styleValue);
              break;
            case "hillshadeExaggeration":
              RCTMLNStyleFactory.setHillshadeExaggeration(layer, styleValue);
              break;
            case "hillshadeExaggerationTransition":
              RCTMLNStyleFactory.setHillshadeExaggerationTransition(layer, styleValue);
              break;
            case "hillshadeShadowColor":
              RCTMLNStyleFactory.setHillshadeShadowColor(layer, styleValue);
              break;
            case "hillshadeShadowColorTransition":
              RCTMLNStyleFactory.setHillshadeShadowColorTransition(layer, styleValue);
              break;
            case "hillshadeHighlightColor":
              RCTMLNStyleFactory.setHillshadeHighlightColor(layer, styleValue);
              break;
            case "hillshadeHighlightColorTransition":
              RCTMLNStyleFactory.setHillshadeHighlightColorTransition(layer, styleValue);
              break;
            case "hillshadeAccentColor":
              RCTMLNStyleFactory.setHillshadeAccentColor(layer, styleValue);
              break;
            case "hillshadeAccentColorTransition":
              RCTMLNStyleFactory.setHillshadeAccentColorTransition(layer, styleValue);
              break;
        }
      }
    }
    public static void setBackgroundLayerStyle(final BackgroundLayer layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "visibility":
              RCTMLNStyleFactory.setVisibility(layer, styleValue);
              break;
            case "backgroundColor":
              RCTMLNStyleFactory.setBackgroundColor(layer, styleValue);
              break;
            case "backgroundColorTransition":
              RCTMLNStyleFactory.setBackgroundColorTransition(layer, styleValue);
              break;
            case "backgroundPattern":
              style.addImage(styleValue, new DownloadMapImageTask.OnAllImagesLoaded() {
                  @Override
                  public void onAllImagesLoaded() {
                      RCTMLNStyleFactory.setBackgroundPattern(layer, styleValue);
                  }
              });
              break;
            case "backgroundPatternTransition":
              RCTMLNStyleFactory.setBackgroundPatternTransition(layer, styleValue);
              break;
            case "backgroundOpacity":
              RCTMLNStyleFactory.setBackgroundOpacity(layer, styleValue);
              break;
            case "backgroundOpacityTransition":
              RCTMLNStyleFactory.setBackgroundOpacityTransition(layer, styleValue);
              break;
        }
      }
    }
    public static void setLightLayerStyle(final Light layer, RCTMLNStyle style) {
      List<String> styleKeys = style.getAllStyleKeys();

      if (styleKeys.size() == 0) {
        return;
      }

      for (String styleKey : styleKeys) {
        final RCTMLNStyleValue styleValue = style.getStyleValueForKey(styleKey);

        switch (styleKey) {
            case "anchor":
              RCTMLNStyleFactory.setAnchor(layer, styleValue);
              break;
            case "position":
              RCTMLNStyleFactory.setPosition(layer, styleValue);
              break;
            case "positionTransition":
              RCTMLNStyleFactory.setPositionTransition(layer, styleValue);
              break;
            case "color":
              RCTMLNStyleFactory.setColor(layer, styleValue);
              break;
            case "colorTransition":
              RCTMLNStyleFactory.setColorTransition(layer, styleValue);
              break;
            case "intensity":
              RCTMLNStyleFactory.setIntensity(layer, styleValue);
              break;
            case "intensityTransition":
              RCTMLNStyleFactory.setIntensityTransition(layer, styleValue);
              break;
        }
      }
    }

    public static void setFillSortKey(FillLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillSortKey(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillSortKey(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setVisibility(FillLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setFillAntialias(FillLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillAntialias(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillAntialias(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setFillOpacity(FillLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setFillOpacityTransition(FillLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillOpacityTransition(transition);
      }
    }

    public static void setFillColor(FillLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setFillColorTransition(FillLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillColorTransition(transition);
      }
    }

    public static void setFillOutlineColor(FillLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillOutlineColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillOutlineColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setFillOutlineColorTransition(FillLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillOutlineColorTransition(transition);
      }
    }

    public static void setFillTranslate(FillLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillTranslate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillTranslate(styleValue.getFloatArray(VALUE_KEY)));
      }
    }


    public static void setFillTranslateTransition(FillLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillTranslateTransition(transition);
      }
    }

    public static void setFillTranslateAnchor(FillLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillTranslateAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillTranslateAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setFillPattern(FillLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        if (styleValue.isImageStringValue()) {
          layer.setProperties(PropertyFactory.fillPattern(styleValue.getImageStringValue()));
        } else {
          layer.setProperties(PropertyFactory.fillPattern(styleValue.getExpression()));
        }
      } else {
        layer.setProperties(PropertyFactory.fillPattern(styleValue.getImageURI()));
      }
    }


    public static void setFillPatternTransition(FillLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillPatternTransition(transition);
      }
    }

    public static void setLineCap(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineCap(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineCap(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setLineJoin(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineJoin(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineJoin(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setLineMiterLimit(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineMiterLimit(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineMiterLimit(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setLineRoundLimit(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineRoundLimit(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineRoundLimit(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setLineSortKey(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineSortKey(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineSortKey(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setVisibility(LineLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setLineOpacity(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setLineOpacityTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLineOpacityTransition(transition);
      }
    }

    public static void setLineColor(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setLineColorTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLineColorTransition(transition);
      }
    }

    public static void setLineTranslate(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineTranslate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineTranslate(styleValue.getFloatArray(VALUE_KEY)));
      }
    }


    public static void setLineTranslateTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLineTranslateTransition(transition);
      }
    }

    public static void setLineTranslateAnchor(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineTranslateAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineTranslateAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setLineWidth(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineWidth(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineWidth(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setLineWidthTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLineWidthTransition(transition);
      }
    }

    public static void setLineGapWidth(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineGapWidth(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineGapWidth(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setLineGapWidthTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLineGapWidthTransition(transition);
      }
    }

    public static void setLineOffset(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineOffset(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineOffset(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setLineOffsetTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLineOffsetTransition(transition);
      }
    }

    public static void setLineBlur(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineBlur(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineBlur(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setLineBlurTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLineBlurTransition(transition);
      }
    }

    public static void setLineDasharray(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineDasharray(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineDasharray(styleValue.getFloatArray(VALUE_KEY)));
      }
    }


    public static void setLineDasharrayTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLineDasharrayTransition(transition);
      }
    }

    public static void setLinePattern(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        if (styleValue.isImageStringValue()) {
          layer.setProperties(PropertyFactory.linePattern(styleValue.getImageStringValue()));
        } else {
          layer.setProperties(PropertyFactory.linePattern(styleValue.getExpression()));
        }
      } else {
        layer.setProperties(PropertyFactory.linePattern(styleValue.getImageURI()));
      }
    }


    public static void setLinePatternTransition(LineLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setLinePatternTransition(transition);
      }
    }

    public static void setLineGradient(LineLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.lineGradient(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.lineGradient(styleValue.getInt(VALUE_KEY)));
      }
    }

    public static void setSymbolPlacement(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.symbolPlacement(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.symbolPlacement(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setSymbolSpacing(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.symbolSpacing(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.symbolSpacing(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setSymbolAvoidEdges(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.symbolAvoidEdges(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.symbolAvoidEdges(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setSymbolSortKey(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.symbolSortKey(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.symbolSortKey(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setSymbolZOrder(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.symbolZOrder(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.symbolZOrder(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setIconAllowOverlap(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconAllowOverlap(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconAllowOverlap(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setIconIgnorePlacement(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconIgnorePlacement(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconIgnorePlacement(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setIconOptional(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconOptional(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconOptional(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setIconRotationAlignment(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconRotationAlignment(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconRotationAlignment(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setIconSize(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconSize(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconSize(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setIconTextFit(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconTextFit(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconTextFit(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setIconTextFitPadding(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconTextFitPadding(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconTextFitPadding(styleValue.getFloatArray(VALUE_KEY)));
      }
    }

    public static void setIconImage(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        if (styleValue.isImageStringValue()) {
          layer.setProperties(PropertyFactory.iconImage(styleValue.getImageStringValue()));
        } else {
          layer.setProperties(PropertyFactory.iconImage(styleValue.getExpression()));
        }
      } else {
        layer.setProperties(PropertyFactory.iconImage(styleValue.getImageURI()));
      }
    }

    public static void setIconRotate(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconRotate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconRotate(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setIconPadding(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconPadding(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconPadding(styleValue.getFloatArray(VALUE_KEY)));
      }
    }

    public static void setIconKeepUpright(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconKeepUpright(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconKeepUpright(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setIconOffset(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconOffset(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconOffset(styleValue.getFloatArray(VALUE_KEY)));
      }
    }

    public static void setIconAnchor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setIconPitchAlignment(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconPitchAlignment(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconPitchAlignment(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setTextPitchAlignment(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textPitchAlignment(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textPitchAlignment(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setTextRotationAlignment(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textRotationAlignment(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textRotationAlignment(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setTextField(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textField(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textField(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setTextFont(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textFont(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textFont(styleValue.getStringArray(VALUE_KEY)));
      }
    }

    public static void setTextSize(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textSize(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textSize(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setTextMaxWidth(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textMaxWidth(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textMaxWidth(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setTextLineHeight(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textLineHeight(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textLineHeight(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setTextLetterSpacing(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textLetterSpacing(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textLetterSpacing(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setTextJustify(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textJustify(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textJustify(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setTextRadialOffset(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textRadialOffset(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textRadialOffset(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setTextVariableAnchor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textVariableAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textVariableAnchor(styleValue.getStringArray(VALUE_KEY)));
      }
    }

    public static void setTextAnchor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setTextMaxAngle(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textMaxAngle(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textMaxAngle(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setTextWritingMode(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textWritingMode(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textWritingMode(styleValue.getStringArray(VALUE_KEY)));
      }
    }

    public static void setTextRotate(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textRotate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textRotate(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setTextPadding(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textPadding(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textPadding(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setTextKeepUpright(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textKeepUpright(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textKeepUpright(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setTextTransform(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textTransform(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textTransform(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setTextOffset(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textOffset(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textOffset(styleValue.getFloatArray(VALUE_KEY)));
      }
    }

    public static void setTextAllowOverlap(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textAllowOverlap(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textAllowOverlap(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setTextIgnorePlacement(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textIgnorePlacement(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textIgnorePlacement(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setTextOptional(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textOptional(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textOptional(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setVisibility(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setIconOpacity(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setIconOpacityTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setIconOpacityTransition(transition);
      }
    }

    public static void setIconColor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setIconColorTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setIconColorTransition(transition);
      }
    }

    public static void setIconHaloColor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconHaloColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconHaloColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setIconHaloColorTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setIconHaloColorTransition(transition);
      }
    }

    public static void setIconHaloWidth(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconHaloWidth(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconHaloWidth(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setIconHaloWidthTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setIconHaloWidthTransition(transition);
      }
    }

    public static void setIconHaloBlur(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconHaloBlur(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconHaloBlur(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setIconHaloBlurTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setIconHaloBlurTransition(transition);
      }
    }

    public static void setIconTranslate(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconTranslate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconTranslate(styleValue.getFloatArray(VALUE_KEY)));
      }
    }


    public static void setIconTranslateTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setIconTranslateTransition(transition);
      }
    }

    public static void setIconTranslateAnchor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.iconTranslateAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.iconTranslateAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setTextOpacity(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setTextOpacityTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setTextOpacityTransition(transition);
      }
    }

    public static void setTextColor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setTextColorTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setTextColorTransition(transition);
      }
    }

    public static void setTextHaloColor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textHaloColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textHaloColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setTextHaloColorTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setTextHaloColorTransition(transition);
      }
    }

    public static void setTextHaloWidth(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textHaloWidth(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textHaloWidth(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setTextHaloWidthTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setTextHaloWidthTransition(transition);
      }
    }

    public static void setTextHaloBlur(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textHaloBlur(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textHaloBlur(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setTextHaloBlurTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setTextHaloBlurTransition(transition);
      }
    }

    public static void setTextTranslate(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textTranslate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textTranslate(styleValue.getFloatArray(VALUE_KEY)));
      }
    }


    public static void setTextTranslateTransition(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setTextTranslateTransition(transition);
      }
    }

    public static void setTextTranslateAnchor(SymbolLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.textTranslateAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.textTranslateAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setCircleSortKey(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleSortKey(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleSortKey(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setVisibility(CircleLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setCircleRadius(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleRadius(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleRadius(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setCircleRadiusTransition(CircleLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setCircleRadiusTransition(transition);
      }
    }

    public static void setCircleColor(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setCircleColorTransition(CircleLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setCircleColorTransition(transition);
      }
    }

    public static void setCircleBlur(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleBlur(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleBlur(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setCircleBlurTransition(CircleLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setCircleBlurTransition(transition);
      }
    }

    public static void setCircleOpacity(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setCircleOpacityTransition(CircleLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setCircleOpacityTransition(transition);
      }
    }

    public static void setCircleTranslate(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleTranslate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleTranslate(styleValue.getFloatArray(VALUE_KEY)));
      }
    }


    public static void setCircleTranslateTransition(CircleLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setCircleTranslateTransition(transition);
      }
    }

    public static void setCircleTranslateAnchor(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleTranslateAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleTranslateAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setCirclePitchScale(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circlePitchScale(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circlePitchScale(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setCirclePitchAlignment(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circlePitchAlignment(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circlePitchAlignment(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setCircleStrokeWidth(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleStrokeWidth(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleStrokeWidth(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setCircleStrokeWidthTransition(CircleLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setCircleStrokeWidthTransition(transition);
      }
    }

    public static void setCircleStrokeColor(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleStrokeColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleStrokeColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setCircleStrokeColorTransition(CircleLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setCircleStrokeColorTransition(transition);
      }
    }

    public static void setCircleStrokeOpacity(CircleLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.circleStrokeOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.circleStrokeOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setCircleStrokeOpacityTransition(CircleLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setCircleStrokeOpacityTransition(transition);
      }
    }

    public static void setVisibility(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setHeatmapRadius(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.heatmapRadius(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.heatmapRadius(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setHeatmapRadiusTransition(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setHeatmapRadiusTransition(transition);
      }
    }

    public static void setHeatmapWeight(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.heatmapWeight(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.heatmapWeight(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setHeatmapIntensity(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.heatmapIntensity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.heatmapIntensity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setHeatmapIntensityTransition(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setHeatmapIntensityTransition(transition);
      }
    }

    public static void setHeatmapColor(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.heatmapColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.heatmapColor(styleValue.getInt(VALUE_KEY)));
      }
    }

    public static void setHeatmapOpacity(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.heatmapOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.heatmapOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setHeatmapOpacityTransition(HeatmapLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setHeatmapOpacityTransition(transition);
      }
    }

    public static void setVisibility(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setFillExtrusionOpacity(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillExtrusionOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillExtrusionOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setFillExtrusionOpacityTransition(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillExtrusionOpacityTransition(transition);
      }
    }

    public static void setFillExtrusionColor(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillExtrusionColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillExtrusionColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setFillExtrusionColorTransition(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillExtrusionColorTransition(transition);
      }
    }

    public static void setFillExtrusionTranslate(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillExtrusionTranslate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillExtrusionTranslate(styleValue.getFloatArray(VALUE_KEY)));
      }
    }


    public static void setFillExtrusionTranslateTransition(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillExtrusionTranslateTransition(transition);
      }
    }

    public static void setFillExtrusionTranslateAnchor(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillExtrusionTranslateAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillExtrusionTranslateAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setFillExtrusionPattern(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        if (styleValue.isImageStringValue()) {
          layer.setProperties(PropertyFactory.fillExtrusionPattern(styleValue.getImageStringValue()));
        } else {
          layer.setProperties(PropertyFactory.fillExtrusionPattern(styleValue.getExpression()));
        }
      } else {
        layer.setProperties(PropertyFactory.fillExtrusionPattern(styleValue.getImageURI()));
      }
    }


    public static void setFillExtrusionPatternTransition(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillExtrusionPatternTransition(transition);
      }
    }

    public static void setFillExtrusionHeight(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillExtrusionHeight(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillExtrusionHeight(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setFillExtrusionHeightTransition(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillExtrusionHeightTransition(transition);
      }
    }

    public static void setFillExtrusionBase(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillExtrusionBase(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillExtrusionBase(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setFillExtrusionBaseTransition(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setFillExtrusionBaseTransition(transition);
      }
    }

    public static void setFillExtrusionVerticalGradient(FillExtrusionLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.fillExtrusionVerticalGradient(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.fillExtrusionVerticalGradient(styleValue.getBoolean(VALUE_KEY)));
      }
    }

    public static void setVisibility(RasterLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setRasterOpacity(RasterLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.rasterOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.rasterOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setRasterOpacityTransition(RasterLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setRasterOpacityTransition(transition);
      }
    }

    public static void setRasterHueRotate(RasterLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.rasterHueRotate(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.rasterHueRotate(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setRasterHueRotateTransition(RasterLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setRasterHueRotateTransition(transition);
      }
    }

    public static void setRasterBrightnessMin(RasterLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.rasterBrightnessMin(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.rasterBrightnessMin(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setRasterBrightnessMinTransition(RasterLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setRasterBrightnessMinTransition(transition);
      }
    }

    public static void setRasterBrightnessMax(RasterLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.rasterBrightnessMax(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.rasterBrightnessMax(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setRasterBrightnessMaxTransition(RasterLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setRasterBrightnessMaxTransition(transition);
      }
    }

    public static void setRasterSaturation(RasterLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.rasterSaturation(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.rasterSaturation(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setRasterSaturationTransition(RasterLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setRasterSaturationTransition(transition);
      }
    }

    public static void setRasterContrast(RasterLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.rasterContrast(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.rasterContrast(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setRasterContrastTransition(RasterLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setRasterContrastTransition(transition);
      }
    }

    public static void setRasterResampling(RasterLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.rasterResampling(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.rasterResampling(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setRasterFadeDuration(RasterLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.rasterFadeDuration(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.rasterFadeDuration(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setVisibility(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setHillshadeIlluminationDirection(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.hillshadeIlluminationDirection(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.hillshadeIlluminationDirection(styleValue.getFloat(VALUE_KEY)));
      }
    }

    public static void setHillshadeIlluminationAnchor(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.hillshadeIlluminationAnchor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.hillshadeIlluminationAnchor(styleValue.getString(VALUE_KEY)));
      }
    }

    public static void setHillshadeExaggeration(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.hillshadeExaggeration(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.hillshadeExaggeration(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setHillshadeExaggerationTransition(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setHillshadeExaggerationTransition(transition);
      }
    }

    public static void setHillshadeShadowColor(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.hillshadeShadowColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.hillshadeShadowColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setHillshadeShadowColorTransition(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setHillshadeShadowColorTransition(transition);
      }
    }

    public static void setHillshadeHighlightColor(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.hillshadeHighlightColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.hillshadeHighlightColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setHillshadeHighlightColorTransition(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setHillshadeHighlightColorTransition(transition);
      }
    }

    public static void setHillshadeAccentColor(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.hillshadeAccentColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.hillshadeAccentColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setHillshadeAccentColorTransition(HillshadeLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setHillshadeAccentColorTransition(transition);
      }
    }

    public static void setVisibility(BackgroundLayer layer, RCTMLNStyleValue styleValue) {
      layer.setProperties(PropertyFactory.visibility(styleValue.getString(VALUE_KEY)));
    }

    public static void setBackgroundColor(BackgroundLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.backgroundColor(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.backgroundColor(styleValue.getInt(VALUE_KEY)));
      }
    }


    public static void setBackgroundColorTransition(BackgroundLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setBackgroundColorTransition(transition);
      }
    }

    public static void setBackgroundPattern(BackgroundLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        if (styleValue.isImageStringValue()) {
          layer.setProperties(PropertyFactory.backgroundPattern(styleValue.getImageStringValue()));
        } else {
          layer.setProperties(PropertyFactory.backgroundPattern(styleValue.getExpression()));
        }
      } else {
        layer.setProperties(PropertyFactory.backgroundPattern(styleValue.getImageURI()));
      }
    }


    public static void setBackgroundPatternTransition(BackgroundLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setBackgroundPatternTransition(transition);
      }
    }

    public static void setBackgroundOpacity(BackgroundLayer layer, RCTMLNStyleValue styleValue) {
      if (styleValue.isExpression()) {
        layer.setProperties(PropertyFactory.backgroundOpacity(styleValue.getExpression()));
      } else {
        layer.setProperties(PropertyFactory.backgroundOpacity(styleValue.getFloat(VALUE_KEY)));
      }
    }


    public static void setBackgroundOpacityTransition(BackgroundLayer layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setBackgroundOpacityTransition(transition);
      }
    }

    public static void setAnchor(Light layer, RCTMLNStyleValue styleValue) {
      layer.setAnchor(styleValue.getString(VALUE_KEY));
    }

    public static void setPosition(Light layer, RCTMLNStyleValue styleValue) {
      Float[] values = styleValue.getFloatArray(VALUE_KEY);
      layer.setPosition(Position.fromPosition(values[0], values[1], values[2]));
    }


    public static void setPositionTransition(Light layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setPositionTransition(transition);
      }
    }

    public static void setColor(Light layer, RCTMLNStyleValue styleValue) {
      layer.setColor(styleValue.getInt(VALUE_KEY));
    }


    public static void setColorTransition(Light layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setColorTransition(transition);
      }
    }

    public static void setIntensity(Light layer, RCTMLNStyleValue styleValue) {
      layer.setIntensity(styleValue.getFloat(VALUE_KEY));
    }


    public static void setIntensityTransition(Light layer, RCTMLNStyleValue styleValue) {
      TransitionOptions transition = styleValue.getTransition();
      if (transition != null) {
        layer.setIntensityTransition(transition);
      }
    }

}

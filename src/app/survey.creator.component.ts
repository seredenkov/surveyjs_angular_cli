import { Component, Input, Output, EventEmitter } from "@angular/core";
import * as SurveyKo from "survey-knockout";
import * as SurveyCreator from "survey-creator";
import * as widgets from "surveyjs-widgets";
import * as Survey from 'survey-angular';
import { textwithbutton} from './widgets/text-with-button';

import "inputmask/dist/inputmask/phone-codes/phone.js";

widgets.icheck(SurveyKo);
widgets.select2(SurveyKo);
widgets.inputmask(SurveyKo);
widgets.jquerybarrating(SurveyKo);
widgets.jqueryuidatepicker(SurveyKo);
widgets.nouislider(SurveyKo);
widgets.select2tagbox(SurveyKo);
widgets.signaturepad(SurveyKo);
widgets.sortablejs(SurveyKo);
widgets.ckeditor(SurveyKo);
widgets.autocomplete(SurveyKo);
widgets.bootstrapslider(SurveyKo);
// widgets.textwithbutton(SurveyKo);  - use if custom widget (textwithbutton) was compiled as part of `widgets`

var CkEditor_ModalEditor = {
  afterRender: function(modalEditor, htmlElement) {
    var editor = window["CKEDITOR"].replace(htmlElement);
    editor.on("change", function() {
      modalEditor.editingValue = editor.getData();
    });
    editor.setData(modalEditor.editingValue);
  },
  destroy: function(modalEditor, htmlElement) {
    var instance = window["CKEDITOR"].instances[htmlElement.id];
    if (instance) {
      instance.removeAllListeners();
      window["CKEDITOR"].remove(instance);
    }
  }
};
SurveyCreator.SurveyPropertyModalEditor.registerCustomWidget(
  "html",
  CkEditor_ModalEditor
);

@Component({
  selector: "survey-creator",
  template: `
    <div id="surveyCreatorContainer"></div>
  `
})
export class SurveyCreatorComponent {
  surveyCreator: SurveyCreator.SurveyCreator;
  @Input() json: any;
  @Output() surveySaved: EventEmitter<Object> = new EventEmitter();
  ngOnInit() {
    SurveyKo.JsonObject.metaData.addProperty(
      "questionbase",
      "popupdescription:text"
    );
    SurveyKo.JsonObject.metaData.addProperty("page", "popupdescription:text");

    Survey.CustomWidgetCollection.Instance.addCustomWidget(textwithbutton, "customtype");
    SurveyKo.CustomWidgetCollection.Instance.addCustomWidget(textwithbutton, "customtype");
    SurveyKo.JsonObject.metaData.addClass("textwithbutton", [], null, "text");
    SurveyKo.JsonObject.metaData.addProperties("textwithbutton", [
      { name: "buttonText", default: "Click Me" }
    ]);

    let options = {
      showEmbededSurveyTab: true,
      useTabsInElementEditor: true,  // doesn't work ?
      showDefaultLanguageInTestSurveyTab: false,
      showInvisibleElementsInTestSurveyTab: false,
      showState: false,
      showPagesInTestSurveyTab: false,
      generateValidJSON: true
    };
    this.surveyCreator = new SurveyCreator.SurveyCreator(
      "surveyCreatorContainer",
      options
    );
    this.surveyCreator.text = JSON.stringify(this.json);
    this.surveyCreator.saveSurveyFunc = this.saveMySurvey;


    // ============================================================
    // add question to ToolBox ("General" category);
    this.surveyCreator
        .toolbox
        .addItem({
          category: "UPMC custom",
          name: "countries",
          isCopied: true,
          iconName: "icon-default",
          title: "All countries",
          json: {
            "type": "dropdown",
            optionsCaption: "Select a country...",
            choicesByUrl: {
              url: "https://restcountries.eu/rest/v2/all"
            }
          }
        });

    this.surveyCreator.toolbox.addItem({
      category: "UPMC custom",
      name: 'textwithbutton1',
      isCopied: true,
      iconName: 'icon-default',
      title: 'Text with button!',
      json: { 'type': 'textwithbutton'}
    });
    // ============================================================
    //  changeCategory
    // surveyCreator.toolbox.changeCategory("panel", "Panels");
    // surveyCreator.toolbox.changeCategory("paneldynamic", "Panels");
    this.surveyCreator.toolbox.changeCategories([
      { name: "panel", category: "Panels" },
      { name: "paneldynamic", category: "Panels" },
      { name: "matrix", category: "Matrix" }
    ]);
    // ============================================================

  }

  saveMySurvey = () => {
    console.log(JSON.stringify(this.surveyCreator.text));
    this.surveySaved.emit(JSON.parse(this.surveyCreator.text));
  };
}

"use strict";

(function ($) {
	// Insert content at cursor position.
	var insertContent = function(editor, content) {
		var insert_form = $(editor.id).closest("form");
		var markdown_input = insert_form
				.find("input,textarea")
				.filter("[name=markdown_content]");
		editor.putText(content);
		var mdcontent = editor.getMarkdownText();
		markdown_input.val(mdcontent);
	};

	// Page load event handler.
	$(function () {
		$(".mdeditor").each(function () {
			var editor = $(this);
			var editor_sequence = editor.data("editor-sequence");
			var content_key = editor.data("editor-content-key-name");
			var primary_key = editor.data("editor-primary-key-name");
			var insert_form = editor.closest("form");
			// 편집 textarea 내의 텍스트 내용
			var content_input = insert_form 
				.find("input,textarea")
				.filter("[name=" + content_key + "]");
			var markdown_input = insert_form
				.find("input,textarea")
				.filter("[name=markdown_content]");
			var editor_height = editor.data("editor-height");
			var editor_wrap = "#mdeditor_" + editor_sequence;
			var editor_textarea = editor_wrap + " .rg_mde_code";

			var where = null;
			var target = insert_form
				.find("input,textarea")
				.filter("[name=" + primary_key + "]");

			var md_editor = new rgMdEditor();
			md_editor.init(editor_wrap);
			md_editor.addPreviewClass("rhymix_content");

			md_editor.setHeight(editor_height + "px");
			var content = markdown_input.val();
			if (content) {
				md_editor.changeContent(markdown_input.val());
			} else {
				content = content_input.val();
				markdown_input.val(content);
				md_editor.changeContent(markdown_input.val());
			}

			// Set editor sequence and other info to the form.
			insert_form[0].setAttribute("editor_sequence", editor_sequence);
			editorRelKeys[editor_sequence] = {};
			editorRelKeys[editor_sequence].primary = insert_form
			  .find("input[name='" + primary_key + "']")
			  .get(0);
			editorRelKeys[editor_sequence].content = content_input;
			editorRelKeys[editor_sequence].func = editorGetContent;

			// Clean up pasted content.
			$(editor_textarea).on("paste", function (event) {
				var clipboard_data =
					event.clipboardData ||
					window.clipboardData ||
					event.originalEvent.clipboardData;
				if (typeof clipboard_data !== "undefined") {
					var content = clipboard_data.getData("text");
				} else {
					return;
				}
				insertContent(md_editor, content);
				event.preventDefault();
			});

			// Copy edited content to the actual input element.
			editor.on("mouseout change", function (event) {
				// preview로 markdown 변환된 내용을 반영해 주고
				md_editor.renderMarkdownData();
				// preview의 내용을 가져온다.
				var content = md_editor.getHtmlText();
				content_input.val(content);
				// markdown text는 따로 가져온다.
				var mdcontent = md_editor.getMarkdownText();
				markdown_input.val(mdcontent);
				event.preventDefault();
			});
		});
	});

	// Simulate CKEditor for file upload integration.
	// 그림 등의 파일 업로드 시 CKEditor 루틴을 차용한다.
	window._getCkeInstance = function (editor_sequence) {
		var md_editor = "#mdeditor_" + editor_sequence;
		var editor_obj = new rgMdEditor();
		editor_obj.selectInitializedEditor(md_editor);

		var turndownService = new TurndownService();

		return {
			getData: function () {
				return editor_obj.getMarkdownText();
			},
			setData: function (content) {
				editor_obj.changeContent(content);
			},
			insertHtml: function (content) {
				var conv_markdown = turndownService.turndown(content);
				conv_markdown += "\n"
				insertContent(editor_obj, conv_markdown);
			},
		};
	};
})(jQuery);

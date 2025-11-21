"use client";
// components/EditContentModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FC, useRef, useState, useEffect } from "react";
import {
  IconUpload,
  IconPhoto,
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconListNumbers,
  IconQuote,
  IconCode,
  IconImageInPicture,
  IconLink,
  IconLinkOff,
} from "@tabler/icons-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { supabase } from "@/lib/supabase";

type Content = {
  id?: number;
  title: string;
  textHtml: string;
  banner: string;
  status: string;
  description?: string;
  metaTitle?: string;
  metaDesc?: string;
  canonicalUrl?: string;
  xTitle?: string;
  xDesc?: string;
  fbTitle?: string;
  fbDesc?: string;
  tagHeader?: string;
  tagFooter?: string;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
};

interface EditContentModalProps {
  open: boolean;
  content: Content | null;
  isEditMode: boolean;
  onClose: () => void;
  onChange: (field: keyof Content, value: string | number) => void;
  onSave: () => void;
}

const EditContentModal: FC<EditContentModalProps> = ({
  open,
  content,
  isEditMode,
  onClose,
  onChange,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  // TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: content?.textHtml || "",
    onUpdate: ({ editor }) => {
      onChange("textHtml", editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        style:
          "min-height:180px; outline:none; white-space:pre-wrap; word-break:break-word;",
        spellcheck: "false",
      },
    },
  });

  // sync when open new record
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content.textHtml || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, content?.id]);

  // TipTap handles typing behavior; no extra contentEditable tweaks needed

  if (!content) return null;

  const uploadToSupabase = async (file: File) => {
    try {
      const path = `content/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("images").getPublicUrl(path);
      return data.publicUrl as string;
    } catch (e) {
      return "";
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Try upload to Supabase storage; fallback to local blob URL
      const publicUrl = await uploadToSupabase(file);
      if (publicUrl) onChange("banner", publicUrl);
      else onChange("banner", URL.createObjectURL(file));
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTextChange = (newValue: string) => {
    setTextAreaValue(newValue);
    onChange("textHtml", newValue);
  };

  const insertHtmlTag = (tag: string) => {
    if (editor) {
      const chain = editor.chain().focus();
      switch (tag) {
        case "bold":
          chain.toggleBold().run();
          return;
        case "italic":
          chain.toggleItalic().run();
          return;
        case "underline":
          chain.toggleUnderline().run();
          return;
        case "h1":
          chain.toggleHeading({ level: 1 }).run();
          return;
        case "h2":
          chain.toggleHeading({ level: 2 }).run();
          return;
        case "h3":
          chain.toggleHeading({ level: 3 }).run();
          return;
        case "ul":
          chain.toggleBulletList().run();
          return;
        case "ol":
          chain.toggleOrderedList().run();
          return;
        case "quote":
          chain.toggleBlockquote().run();
          return;
        case "code":
          chain.toggleCodeBlock().run();
          return;
        case "clear":
          chain.unsetAllMarks().clearNodes().run();
          return;
        case "image":
          setShowImageDialog(true);
          return;
        default:
          return;
      }
    }

    const textarea = document.getElementById("html-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let insertText = "";
    switch (tag) {
      case "bold":
        if (start !== end) insertText = `<strong>${selectedText}</strong>`;
        else insertText = `<strong></strong>`;
        break;
      case "italic":
        if (start !== end) insertText = `<em>${selectedText}</em>`;
        else insertText = `<em></em>`;
        break;
      case "underline":
        if (start !== end) insertText = `<u>${selectedText}</u>`;
        else insertText = `<u></u>`;
        break;
      case "ul":
        insertText = `<ul>\n  <li>${selectedText || ""}</li>\n</ul>`;
        break;
      case "ol":
        insertText = `<ol>\n  <li>${selectedText || ""}</li>\n</ol>`;
        break;
      case "quote":
        if (start !== end) insertText = `<blockquote>${selectedText}</blockquote>`;
        else insertText = `<blockquote></blockquote>`;
        break;
      case "code":
        if (start !== end) insertText = `<code>${selectedText}</code>`;
        else insertText = `<code></code>`;
        break;
      case "image":
        setShowImageDialog(true);
        return;
      default:
        insertText = selectedText;
    }

    const newValue =
      textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
    handleTextChange(newValue);

    setTimeout(() => {
      textarea.focus();
      // Place caret inside the inserted tag when empty
      const caretOffset = (() => {
        if (start !== end) return start + insertText.length;
        const openTagLen = insertText.indexOf("</") > -1 ? insertText.indexOf("</") : insertText.length;
        return start + openTagLen;
      })();
      textarea.setSelectionRange(caretOffset, caretOffset);
    }, 0);
  };

  const insertImage = () => {
    if (!imageUrl.trim()) return;
    if (editor) editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageDialog(false);
  };

  const handleImageDialogClose = () => {
    setShowImageDialog(false);
    setImageUrl("");
  };

  const fieldValue = (key: keyof Content) =>
    ((content as any)?.[key] as string | number | undefined) ?? "";

  // Keep labels floated so they never overlap with borders on multiline fields.
  const floatingLabelProps = { InputLabelProps: { shrink: true } };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          {isEditMode ? "Edit Content" : "Create New Content"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Title"
            value={content.title}
            onChange={(e) => onChange("title", e.target.value)}
            fullWidth
            required
          />

          <Box>
            <Typography variant="subtitle2" mb={1}>Content Editor</Typography>

            {/* TipTap Editor */}

            {/* Visual or HTML editor */}
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              p: 1,
              mb: 1,
              '& .ProseMirror': {
                minHeight: 180,
                outline: 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              },
            }}
          >
            {editor && <EditorContent editor={editor} />}
          </Box>
          {/* Toolbar for TipTap */}
          <Box sx={{ mb: 1 }}>
            <ToggleButtonGroup size="small" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
              <ToggleButton value="bold" onClick={() => insertHtmlTag("bold")} title="Bold">
                <IconBold size={16} />
              </ToggleButton>
              <ToggleButton value="italic" onClick={() => insertHtmlTag("italic")} title="Italic">
                <IconItalic size={16} />
              </ToggleButton>
              <ToggleButton value="underline" onClick={() => insertHtmlTag("underline")} title="Underline">
                <IconUnderline size={16} />
              </ToggleButton>
              <ToggleButton value="h1" onClick={() => insertHtmlTag("h1")} title="H1">
                H1
              </ToggleButton>
              <ToggleButton value="h2" onClick={() => insertHtmlTag("h2")} title="H2">
                H2
              </ToggleButton>
              <ToggleButton value="h3" onClick={() => insertHtmlTag("h3")} title="H3">
                H3
              </ToggleButton>
              <ToggleButton value="ul" onClick={() => insertHtmlTag("ul")} title="Unordered List">
                <IconList size={16} />
              </ToggleButton>
              <ToggleButton value="ol" onClick={() => insertHtmlTag("ol")} title="Ordered List">
                <IconListNumbers size={16} />
              </ToggleButton>
              <ToggleButton value="quote" onClick={() => insertHtmlTag("quote")} title="Quote">
                <IconQuote size={16} />
              </ToggleButton>
              <ToggleButton value="code" onClick={() => insertHtmlTag("code")} title="Code Block">
                <IconCode size={16} />
              </ToggleButton>
              <ToggleButton
                value="link"
                onClick={() => {
                  if (!editor) return;
                  const prev = editor.getAttributes('link').href as string;
                  const url = window.prompt('Enter URL', prev || 'https://');
                  if (url === null) return;
                  if (url === '') editor.chain().focus().unsetLink().run();
                  else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                }}
                title="Insert/Edit Link"
              >
                <IconLink size={16} />
              </ToggleButton>
              <ToggleButton value="unlink" onClick={() => editor?.chain().focus().unsetLink().run()} title="Remove Link">
                <IconLinkOff size={16} />
              </ToggleButton>
              <ToggleButton value="image" onClick={() => insertHtmlTag("image")} title="Insert Image">
                <IconImageInPicture size={16} />
              </ToggleButton>
              <ToggleButton value="clear" onClick={() => insertHtmlTag("clear")} title="Clear Formatting">
                Clear
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
              Use toolbar to format text visually.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Banner Image
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={content.banner}
                variant="square"
                sx={{
                  height: 80,
                  width: 120,
                  borderRadius: "8px",
                  border: "2px dashed #ccc",
                }}
              >
                <IconPhoto size={40} />
              </Avatar>
              <Stack spacing={1} sx={{ flexGrow: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<IconUpload size={20} />}
                  onClick={handleImageUpload}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Upload Image
                </Button>
                <Typography variant="caption" color="textSecondary">
                  Or enter image URL below
                </Typography>
              </Stack>
            </Stack>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </Box>

          <TextField
            label="Banner Image URL"
            value={content.banner}
            onChange={(e) => onChange("banner", e.target.value)}
            fullWidth
            helperText="Enter the URL for the banner image or upload a file above"
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={content.status}
              label="Status"
              onChange={(e) => onChange("status", e.target.value)}
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Description"
            value={fieldValue("description")}
            onChange={(e) => onChange("description", e.target.value)}
            {...floatingLabelProps}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            label="Meta Title"
            value={fieldValue("metaTitle")}
            onChange={(e) => onChange("metaTitle", e.target.value)}
            {...floatingLabelProps}
            fullWidth
          />

          <TextField
            label="Meta Description"
            value={fieldValue("metaDesc")}
            onChange={(e) => onChange("metaDesc", e.target.value)}
            {...floatingLabelProps}
            multiline
            rows={2}
            fullWidth
          />

          <TextField
            label="Canonical URL"
            value={fieldValue("canonicalUrl")}
            onChange={(e) => onChange("canonicalUrl", e.target.value)}
            {...floatingLabelProps}
            fullWidth
          />

          <TextField
            label="X Title"
            value={fieldValue("xTitle")}
            onChange={(e) => onChange("xTitle", e.target.value)}
            {...floatingLabelProps}
            fullWidth
          />

          <TextField
            label="X Description"
            value={fieldValue("xDesc")}
            onChange={(e) => onChange("xDesc", e.target.value)}
            {...floatingLabelProps}
            multiline
            rows={2}
            fullWidth
          />

          <TextField
            label="Facebook Title"
            value={fieldValue("fbTitle")}
            onChange={(e) => onChange("fbTitle", e.target.value)}
            {...floatingLabelProps}
            fullWidth
          />

          <TextField
            label="Facebook Description"
            value={fieldValue("fbDesc")}
            onChange={(e) => onChange("fbDesc", e.target.value)}
            {...floatingLabelProps}
            multiline
            rows={2}
            fullWidth
          />

          <TextField
            label="Tag Header (Code Injection)"
            value={fieldValue("tagHeader")}
            onChange={(e) => onChange("tagHeader", e.target.value)}
            {...floatingLabelProps}
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            label="Tag Footer (Code Injection)"
            value={fieldValue("tagFooter")}
            onChange={(e) => onChange("tagFooter", e.target.value)}
            {...floatingLabelProps}
            multiline
            rows={3}
            fullWidth
          />

          {isEditMode && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Content Information
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Created by: {content.createdBy || "N/A"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Created date: {content.createdDate || "N/A"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last updated by: {content.updatedBy || "N/A"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last updated: {content.updatedDate || "N/A"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} variant="contained" color="primary">
            {isEditMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Insert Dialog */}
      <Dialog
        open={showImageDialog}
        onClose={handleImageDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            placeholder="https://example.com/image.jpg"
            helperText="Enter the URL of the image you want to insert"
          />
          <TextField
            label="Alt Text (optional)"
            fullWidth
            placeholder="Description of the image"
            helperText="This text will be used as alt text for accessibility"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImageDialogClose}>Cancel</Button>
          <Button onClick={insertImage} variant="contained" color="primary">
            Insert Image
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditContentModal;

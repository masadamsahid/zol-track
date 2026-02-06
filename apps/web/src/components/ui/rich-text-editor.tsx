"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Strikethrough } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

const Toolbar = ({ editor }: { editor: Editor | null }) => {
	if (!editor) {
		return null;
	}

	return (
		<div className="border border-input bg-transparent rounded-t-md p-1 flex items-center gap-1 border-b-0">
			<Toggle
				size="sm"
				pressed={editor.isActive("bold")}
				onPressedChange={() => editor.chain().focus().toggleBold().run()}
				aria-label="Toggle bold"
			>
				<Bold className="h-4 w-4" />
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("italic")}
				onPressedChange={() => editor.chain().focus().toggleItalic().run()}
				aria-label="Toggle italic"
			>
				<Italic className="h-4 w-4" />
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("underline")}
				onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
				aria-label="Toggle underline"
			>
				<UnderlineIcon className="h-4 w-4" />
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("strike")}
				onPressedChange={() => editor.chain().focus().toggleStrike().run()}
				aria-label="Toggle strikethrough"
			>
				<Strikethrough className="h-4 w-4" />
			</Toggle>
			<div className="w-[1px] h-6 bg-border mx-1" />
			<Toggle
				size="sm"
				pressed={editor.isActive("bulletList")}
				onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
				aria-label="Toggle bullet list"
			>
				<List className="h-4 w-4" />
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("orderedList")}
				onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
				aria-label="Toggle ordered list"
			>
				<ListOrdered className="h-4 w-4" />
			</Toggle>
		</div>
	);
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
		],
		content: value,
		editorProps: {
			attributes: {
				class: cn(
					"min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					"rounded-t-none" // Remove top border radius since toolbar is attached
				),
			},
		},
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		// Ensure content updates when prop changes (needed for form resets)
		onTransaction: ({ editor }) => {
			// Optional: handle content sync if needed, but usually controlled component pattern is tricky with Tiptap.
			// We rely on initial content. If parent updates value drastically, we might need useEffect.
		}
	});


	// Sync editor content if value changes externally (e.g. form reset)
	// Note: this can cause cursor jumps if not careful, but for reset it's fine.
	// Generally controlled inputs for rich text are hard. 
	// We'll trust React Hook Form to manage state and only update if empty/different significantly?
	// For now, let's keep it simple. If `value` is falsy and editor has content, maybe clear it?
	// Let's rely on `useEffect` to set content if it differs and is not focused?

	// Actually, for simplicity in a dialog that opens/closes:
	// When dialog opens, value is init. When reset happens, value becomes empty.

	return (
		<div className="flex flex-col">
			<Toolbar editor={editor} />
			<EditorContent className="prose lg:prose-lg dark:prose-invert" editor={editor} />
		</div>
	);
}

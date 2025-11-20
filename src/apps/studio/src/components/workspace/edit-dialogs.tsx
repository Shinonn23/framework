"use client";

import React, { useState } from "react";
import {
    WorkspaceComponent,
    HeaderComponent,
    TextComponent,
    CardComponent,
    ShortcutComponent,
    SpacerComponent,
    QuickListComponent,
} from "@/types/workspace/meta";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconPicker, IconName } from "@/components/ui/icon-picker";
import { Trash2, Plus } from "lucide-react";

// Base Dialog Props
interface BaseEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    component: WorkspaceComponent;
    onSave: (updatedProps: any) => void;
}

// Header Edit Dialog
export function HeaderEditDialog({
    open,
    onOpenChange,
    component,
    onSave,
}: BaseEditDialogProps) {
    const props = (component as HeaderComponent).props;
    const [title, setTitle] = useState(props.title || "");
    const [subtitle, setSubtitle] = useState(props.subtitle || "");

    const handleSave = () => {
        onSave({ title, subtitle });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Header</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                        <Input
                            id="subtitle"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="Enter subtitle"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Text Edit Dialog
export function TextEditDialog({
    open,
    onOpenChange,
    component,
    onSave,
}: BaseEditDialogProps) {
    const props = (component as TextComponent).props;
    const [content, setContent] = useState(props.content || "");
    const [align, setAlign] = useState<string>(props.align || "left");
    const [variant, setVariant] = useState<string>(props.variant || "body");

    const handleSave = () => {
        onSave({ content, align, variant });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Text</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Input
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter content"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="align">Alignment</Label>
                        <Select value={align} onValueChange={setAlign}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="variant">Variant</Label>
                        <Select value={variant} onValueChange={setVariant}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="body">Body</SelectItem>
                                <SelectItem value="subtitle">
                                    Subtitle
                                </SelectItem>
                                <SelectItem value="caption">Caption</SelectItem>
                                <SelectItem value="section-header">
                                    Section Header
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Card Edit Dialog
export function CardEditDialog({
    open,
    onOpenChange,
    component,
    onSave,
}: BaseEditDialogProps) {
    const props = (component as CardComponent).props;
    const [title, setTitle] = useState(props.title || "");
    const [description, setDescription] = useState(props.description || "");
    const [icon, setIcon] = useState(props.icon || "");

    const handleSave = () => {
        onSave({ title, description, icon });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Card</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description (Optional)
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Icon (Optional)</Label>
                        <IconPicker
                            value={icon as IconName}
                            onValueChange={setIcon}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Shortcut Edit Dialog
export function ShortcutEditDialog({
    open,
    onOpenChange,
    component,
    onSave,
}: BaseEditDialogProps) {
    const props = (component as ShortcutComponent).props;
    const [label, setLabel] = useState(props.label || "");
    const [href, setHref] = useState(props.href || "");
    const [icon, setIcon] = useState(props.icon || "");

    const handleSave = () => {
        onSave({ label, href, icon });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Shortcut</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="label">Label</Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Enter label"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="href">Link (href)</Label>
                        <Input
                            id="href"
                            value={href}
                            onChange={(e) => setHref(e.target.value)}
                            placeholder="/workspace/example"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Icon (Optional)</Label>
                        <IconPicker
                            value={icon as IconName}
                            onValueChange={setIcon}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Spacer Edit Dialog
export function SpacerEditDialog({
    open,
    onOpenChange,
    component,
    onSave,
}: BaseEditDialogProps) {
    const props = (component as SpacerComponent).props;
    const [height, setHeight] = useState(props.height?.toString() || "20");

    const handleSave = () => {
        onSave({ height: parseInt(height) || 20 });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Spacer</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="height">Height (px)</Label>
                        <Input
                            id="height"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="20"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Quicklist Edit Dialog
export function QuicklistEditDialog({
    open,
    onOpenChange,
    component,
    onSave,
}: BaseEditDialogProps) {
    const props = (component as QuickListComponent).props;
    const [title, setTitle] = useState(props.title || "");
    const [description, setDescription] = useState(props.description || "");
    const [items, setItems] = useState<
        Array<{ label: string; icon?: string; href: string }>
    >(props.items || []);

    const addItem = () => {
        setItems([...items, { label: "", href: "", icon: "" }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (
        index: number,
        field: "label" | "href" | "icon",
        value: string,
    ) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSave = () => {
        onSave({ title, description, items });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Quick List</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title (Optional)</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description (Optional)
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Items</Label>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addItem}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-3 space-y-2"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium">
                                            Item {index + 1}
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>

                                    <Input
                                        value={item.label}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "label",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Label"
                                    />

                                    <Input
                                        value={item.href}
                                        onChange={(e) =>
                                            updateItem(
                                                index,
                                                "href",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="/workspace/example"
                                    />

                                    <IconPicker
                                        value={item.icon as IconName}
                                        onValueChange={(iconName: IconName) =>
                                            updateItem(index, "icon", iconName)
                                        }
                                    />
                                </div>
                            ))}

                            {items.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No items. Click "Add Item" to get started.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CommonButton } from "@/components/ui/CommonButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const quickPostSchema = z.object({
  title: z.string().min(2, "제목을 2자 이상 입력해주세요."),
  content: z.string().min(10, "내용을 10자 이상 입력해주세요."),
  tags: z.string().optional()
});

type QuickPostValues = z.infer<typeof quickPostSchema>;

export function QuickPost() {
  const form = useForm<QuickPostValues>({
    resolver: zodResolver(quickPostSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "#산책 #건강"
    }
  });

  const onSubmit = form.handleSubmit(() => {
    form.reset();
  });

  return (
    <Card className="gradient-shell">
      <CardHeader>
        <CardTitle>빠른 성장 기록</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input placeholder="제목" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-xs text-ember">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Textarea
            placeholder="오늘 우리 아이의 변화나 산책 기록을 적어주세요."
            {...form.register("content")}
          />
          {form.formState.errors.content && (
            <p className="text-xs text-ember">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Input placeholder="#태그" {...form.register("tags")} />
        </div>
        <div className="flex flex-wrap gap-2">
          <CommonButton type="button" variant="secondary" size="sm">
            <ImageIcon className="h-4 w-4" /> 사진 추가
          </CommonButton>
          <CommonButton type="button" variant="secondary" size="sm">
            <Tag className="h-4 w-4" /> 태그 추천
          </CommonButton>
        </div>
        <CommonButton onClick={onSubmit} className="w-full">
          기록 공유하기
        </CommonButton>
      </CardContent>
    </Card>
  );
}

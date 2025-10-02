"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Post, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Edit, X } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPosts();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await api.getMyPosts();
      console.log("Profile posts data:", data);
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post.id);
    setEditTitle(post.title || "");
    setEditContent(post.content);
    setEditImage(null);
    setEditImagePreview(post.image ? `https://social-api.pyaesone.com${post.image}` : null);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditTitle("");
    setEditContent("");
    setEditImage(null);
    setEditImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePost = async (postId: number) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    setSubmitting(true);
    try {
      await api.updatePost(postId, editTitle, editContent, editImage || undefined);
      await loadPosts();
      await loadProfile();
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await api.deletePost(postToDelete);
      await loadPosts();
      await loadProfile();
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile Card */}
        <Card className="shadow-md border-gray-200">
          <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                  <AvatarFallback className="text-3xl sm:text-4xl bg-gray-200 text-gray-700">
                    {profile.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{profile.name}</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 break-all px-4">{profile.email}</p>
              <div className="flex justify-center gap-6 sm:gap-12">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{profile.post_count || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{profile.reaction_count || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{profile.comment_count || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Comments</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Posts Section */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 px-2 sm:px-0">Your Posts</h3>
          <div className="space-y-4 sm:space-y-5">
            {posts.length === 0 ? (
              <Card className="shadow-md border-gray-200">
                <CardContent className="py-12 text-center text-gray-500">
                  <p>You haven't created any posts yet.</p>
                  <Link href="/home">
                    <Button className="mt-4 bg-black hover:bg-gray-800">Create your first post</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="shadow-md border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-200 text-gray-700">{profile.name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{profile.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(post.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPost(post)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(post.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {editingPost === post.id ? (
                      /* Edit Form */
                      <div className="space-y-3 mb-3">
                        <Input
                          placeholder="Post title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="border-gray-300"
                          maxLength={100}
                        />
                        <Textarea
                          placeholder="Post content"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[80px] resize-none border-gray-300"
                          maxLength={500}
                        />
                        <div className="text-right text-xs text-gray-400">
                          {editContent.length}/500
                        </div>

                        {editImagePreview && (
                          <div className="relative">
                            <img src={editImagePreview} alt="Preview" className="rounded-lg max-h-64 object-cover w-full" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setEditImage(null);
                                setEditImagePreview(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <input
                            id={`image-edit-${post.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                          <label htmlFor={`image-edit-${post.id}`}>
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span className="cursor-pointer">Change Image</span>
                            </Button>
                          </label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={submitting}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePost(post.id)}
                              disabled={submitting || !editTitle.trim() || !editContent.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Display Post */
                      <>
                        <div className="mb-3">
                          {post.title && (
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                          )}
                          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                        </div>

                        {post.image && (
                          <img
                            src={`https://social-api.pyaesone.com${post.image}`}
                            alt="Post"
                            className="rounded-xl w-full mb-3 object-cover max-h-96"
                          />
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-6 py-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.reaction_count || post._count?.reactions || 0}</span>
                      </div>
                      <button
                        onClick={async () => {
                          const commentCount = post.comment_count || post._count?.comments || 0;
                          const currentPostId = post.id;

                          if (commentCount > 0) {
                            const isCurrentlyExpanded = expandedComments[currentPostId];

                            if (isCurrentlyExpanded) {
                              setExpandedComments(prev => ({ ...prev, [currentPostId]: false }));
                              return;
                            }

                            // if (!post.comments) {
                            //   try {
                            //     const comments = await api.getComments(currentPostId);
                            //     setPosts(prevPosts =>
                            //       prevPosts.map(p =>
                            //         p.id === currentPostId ? { ...p, comments } : p
                            //       )
                            //     );
                            //   } catch (error) {
                            //     console.error("Failed to fetch comments:", error);
                            //     return;
                            //   }
                            // }

                            setExpandedComments(prev => ({ ...prev, [currentPostId]: true }));
                          }
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comment_count || post._count?.comments || 0}</span>
                        {(post.comment_count || post._count?.comments || 0) > 0 && (
                          expandedComments[post.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Comments Section */}
                    {expandedComments[post.id] && post.comments && post.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="space-y-3">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gray-300 text-gray-700">
                                  {comment.author?.name?.[0].toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                                <p className="font-semibold text-sm text-gray-900">{comment.author?.name || "Unknown"}</p>
                                <p className="text-sm text-gray-800">{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="cursor-pointer mr-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="cursor-pointer bg-black"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

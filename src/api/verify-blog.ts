import type {
  VerifySiteResponse,
  Blog,
  CommentData,
  Pagination,
  ReplyData,
} from "./types";

const baseUrl = "http://localhost:8000/api";
const clientId = "f040ce5d-dfaa-4825-8d62-ad1adfc52fe6";

export const authenticate = async () => {
  // Check if local storage has token
  const token = localStorage.getItem("token");
  if (token) {
    const site = localStorage.getItem("site");
    return {
      token,
      site: JSON.parse(site || "{}"),
    } as VerifySiteResponse;
  }
  const response = await fetch(`${baseUrl}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Key": clientId,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to authenticate");
  }
  const data = (await response.json()) as VerifySiteResponse;
  localStorage.setItem("token", data.token);
  localStorage.setItem("site", JSON.stringify(data.site));
  return data;
};

export const verifyBlog = async ({
  url,
  token,
  siteId,
}: {
  url: string;
  token: string;
  siteId: string;
}) => {
  const response = await fetch(`${baseUrl}/blogs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url,
      site_id: siteId,
    }),
  });
  const data = (await response.json()) as {
    message: string;
    blog: Blog;
  };
  return data;
};

export const getComments = async ({
  siteId,
  token,
  page = 1,
}: {
  siteId: string;
  token: string;
  page?: number;
}) => {
  const response = await fetch(
    `${baseUrl}/blogs/${siteId}/comments?page=${page}`,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = (await response.json()) as {
    comments: CommentData[];
    pagination: Pagination;
  };
  return data;
};

export const addComment = async ({
  siteId,
  token,
  comment,
  parentId,
}: {
  siteId: string;
  token: string;
  comment: CommentData;
  parentId?: number;
}) => {
  const response = await fetch(`${baseUrl}/blogs/${siteId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...comment,
      parent_id: parentId,
    }),
  });
  const data = (await response.json()) as CommentData;
  return data;
};


export const toggleReaction = async ({
  blogId,
  token,
  commentId,
  reaction,
}: {
  blogId: string;
  token: string;
  commentId?: number;
  reaction: {
    type: string;
    emoji: string;
  };
}) => {
  const response = await fetch(`${baseUrl}/blogs/${blogId}/reactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: reaction.type,
      comment_id: commentId,
    }),
  });
  const data = (await response.json()) as CommentData;
  return data;
};
  
"use client";

import { deleteRatingFromListAction } from "../actions";

export default function DeleteRatingButton({ id, label, query }: { id: string; label: string; query: string }) {
  return (
    <form action={deleteRatingFromListAction.bind(null, query, id)}>
      <button
        type="submit"
        className="text-red-400 hover:text-red-300"
        onClick={(e) => {
          if (!confirm(`Delete this rating (${label})?`)) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}

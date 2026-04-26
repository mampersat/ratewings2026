"use client";

import { deleteSpotAction } from "../actions";

export default function DeleteSpotButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteSpotAction.bind(null, id)}>
      <button
        type="submit"
        className="text-red-400 hover:text-red-300"
        onClick={(e) => {
          if (!confirm(`Delete "${name}" and all its ratings?`)) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}

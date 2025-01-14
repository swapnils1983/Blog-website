function addEventListenerIfExists(elementId, event, handler) {

  const element = document.getElementById(elementId);
  if (element) element.addEventListener(event, handler);
}

const editor = document.getElementById("main-editor");
const toolbarButtons = document.querySelectorAll(".editor-btn");

toolbarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    editor.focus();

    const command = button.getAttribute("id");

    if (command == "h1" || command == "h2") {
      document.execCommand("formatBlock", false, command.toUpperCase());
    } else {
      document.execCommand(command, false, null);
    }
  });
});

addEventListenerIfExists("insertImage", "click", () => {
  editor.focus();
  const imageUrl = prompt("Enter image url:");

  if (imageUrl) {
    const imgTag = `<img src="${imageUrl}" alt="Image" style="width: 300px; height: auto; border: 1px solid #ccc; padding: 5px; border-radius: 4px;">`;
    document.execCommand("insertHTML", false, imgTag);
  }
});

addEventListenerIfExists("insertHTML", "click", () => {
  editor.focus();
  const videoUrl = prompt("Enter YouTube video url:");

  if (videoUrl) {
    const videoId = extractYouTubeVideoId(videoUrl);

    if (videoId) {
      const iframeTag = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: auto; height: auto;"></iframe>`;
      document.execCommand("insertHTML", false, iframeTag);
    } else {
      alert("Enter valid url");
    }
  }
});


function extractYouTubeVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}


addEventListenerIfExists("createLink", "click", () => {
  const linkUrl = prompt("Enter link url:");
  editor.focus();

  if (linkUrl) {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      const linkTag = `<a href="${linkUrl}" target="_blank">${selectedText}</a>`;
      document.execCommand("insertHTML", false, linkTag);
    } else {
      alert("Highlight text to turn it into a link");
    }
  }
});

addEventListenerIfExists("fontColor", "input", (e) => {
  editor.focus();
  document.execCommand("foreColor", false, e.target.value);
});

addEventListenerIfExists("save-blog", "click", () => {
  const title = document.getElementById("blog-title").value.trim();
  const content = editor.innerHTML.trim();

  if (!title) {
    alert("Title cannot be empty");
    return;
  }
  if (!content) {
    alert("Content cannot be empty");
    return;
  }

  const posts = JSON.parse(localStorage.getItem("blog-posts") || "[]");
  posts.push({ id: Date.now(), title, content });
  localStorage.setItem("blog-posts", JSON.stringify(posts));
  alert("Blog saved");

  document.getElementById("blog-title").value = "";
  editor.innerHTML = "";
});

addEventListenerIfExists("add-note-btn", "click", () => {
  const noteInput = document.getElementById("new-note-input");
  const noteText = noteInput.value.trim();

  if (!noteText) {
    alert("Note cannot be empty");
    return;
  }

  const notes = JSON.parse(localStorage.getItem("blog-notes") || "[]");
  const timestamp = new Date().toLocaleString();
  notes.push({ id: Date.now(), text: noteText, time: timestamp });
  localStorage.setItem("blog-notes", JSON.stringify(notes));
  noteInput.value = "";
  displayNotes();
});


function displayNotes() {
  const notesList = document.getElementById("notes-list");
  if (!notesList) return;

  const notes = JSON.parse(localStorage.getItem("blog-notes") || "[]");
  notesList.innerHTML = notes
    .map(
      (note) =>
        `<div class="note-item"><div>${note.text}</div><div class="note-time">${note.time}</div></div>`
    )
    .join("");
}


function displayBlogs() {
  const blogList = document.getElementById("blog-list");
  if (!blogList) return;

  const blogs = JSON.parse(localStorage.getItem("blog-posts") || "[]");
  blogList.innerHTML = blogs.length
    ? blogs
        .map(
          (blog) => `
        <div class="post-container">
          <h2 class="blog-heading">${blog.title}</h2>
          <div class="post-inner">${blog.content}</div>
          <div class="post">
            <button class="btn edit-btn" onclick="editBlog(${blog.id})">Edit</button>
            <button class="btn delete-btn" onclick="deleteBlog(${blog.id})">Delete</button>
          </div>
        </div>`
        )
        .join("")
    : '<p style="font-size:3rem;">No blogs found. Create one <a href="index.html">here</a>.</p>';
}




function editBlog(blogId) {
  const blogs = JSON.parse(localStorage.getItem("blog-posts") || "[]");
  const blog = blogs.find((item) => item.id === blogId);
  if (blog) {
    localStorage.setItem("editing-blog", JSON.stringify(blog));
    deleteBlog(blogId);
    window.location.href = "index.html";
  }
}


function deleteBlog(blogId) {
  const blogs = JSON.parse(localStorage.getItem("blog-posts") || "[]");
  const updatedBlogs = blogs.filter((item) => item.id !== blogId);
  localStorage.setItem("blog-posts", JSON.stringify(updatedBlogs));
  displayBlogs();
}



document.addEventListener("DOMContentLoaded", () => {
  const blog = JSON.parse(localStorage.getItem("editing-blog") || null);
  if (blog) {
    document.getElementById("blog-title").value = blog.title;
    editor.innerHTML = blog.content;
    localStorage.removeItem("editing-blog");
  }
  displayNotes();
  displayBlogs();
});

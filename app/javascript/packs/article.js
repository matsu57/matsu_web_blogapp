import $ from "jquery";
import axios from "axios";
import { csrfToken } from "rails-ujs";

axios.defaults.headers.common["X-CSRF-Token"] = csrfToken();

// ハートの表示を切り替える
const handleHeartDisplay = (hasLiked) => {
  if (hasLiked) {
    $(".active-heart").removeClass("hidden");
  } else {
    $(".inactive-heart").removeClass("hidden");
  }
};

const handleContactForm = () => {
  // コメント投稿フォームを表示する
  $(".show-comment-form").on("click", () => {
    $(".show-comment-form").addClass("hidden");
    $(".comment-text-area").removeClass("hidden");
  });
}

// コメントを表示する
const appendNewComment = (comment) => {
  $(".comments-container").append(`<div class="article_comment"><p>${comment.content}</p></div>`);
}

// articleのshowが表示されたときの挙動
document.addEventListener("turbolinks:load", () => {
  const dataset = $("#article-show").data();
  const articleId = dataset.articleId;

  // コメントの取得と表示
  axios.get(`/articles/${articleId}/comments`).then((response) => {
    const comments = response.data;
    comments.forEach((comment) => {
      appendNewComment(comment);
    });
  });

  handleContactForm();


  // コメント投稿ボタンが押されたらformの値を投稿する
  $(".add-comment-button").on("click", () => {
    const content = $("#comment_content").val();
    if (!content) {
      window.alert('コメントを入力してください')
    }
    else {
      axios.post(`/articles/${articleId}/comments`, {
        comment: { content: content }
        // comment_paramsで指定されている形式にする
      })
      .then((res) => {
        const comment = res.data
        appendNewComment(comment);
        $("#comment_content").val('');
      })
    }
  });

  // ハートを表示する
  axios.get(`/articles/${articleId}/like`).then((response) => {
    const hasLiked = response.data.hasLiked;
    handleHeartDisplay(hasLiked);
  });

  // ハートがクリックされたら状態を変更する
  $(".inactive-heart").on("click", () => {
    axios
      .post(`/articles/${articleId}/like`)
      .then((response) => {
        if (response.data.status === "ok") {
          $(".active-heart").removeClass("hidden");
          $(".inactive-heart").addClass("hidden");
        }
      })
      .catch((e) => {
        window.alert("Error");
        console.log(e);
      });
  });
  $(".active-heart").on("click", () => {
    axios
      .delete(`/articles/${articleId}/like`)
      .then((response) => {
        if (response.data.status === "ok") {
          $(".active-heart").addClass("hidden");
          $(".inactive-heart").removeClass("hidden");
        }
      })
      .catch((e) => {
        window.alert("Error");
        console.log(e);
      });
  });
});
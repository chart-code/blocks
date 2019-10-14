<style>
  a{
    display: inline-block;
    width: 220px;
    height: 120px;
    margin: 5px;
    text-decoration: none;
    outline: .5px solid #000;
    vertical-align: bottom;
  }

  p{
    position: relative;
    top: -10px;
    left: 5px;
    text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;
  }

  a:hover{
    text-decoration: underline;
  }
</style>

<script context="module">
  export async function preload({ params, query }) {
    var user = params.user

    const res = await this.fetch(`${params.slug}/gists.json`);
    const gists = await res.json();


    if (res.status === 200) {
      return { user, gists };
    } else {
      this.error(res.status, data.message);
      return { user }
    }
  }
</script>

<script>
  export let user;
  export let gists;
</script>



<svelte:head>
  <title>{user}'s blocks</title>
</svelte:head>


<h1>{user}'s blocks</h1>

{#each gists as gist}
  <a 
    target="_blank" 
    style="background-image:url('https://gist.githubusercontent.com/1wheel/{gist.id}/raw/thumbnail.png')"
    href="https://www.youtube.com/watch?v={gist.id}">
    <p>{gist.description || gist.id.substr(0, 20)}
  </a>
{/each}


<!-- https://gist.githubusercontent.com/1wheel/ed387b59d4968d1ed9ffbac10d13b22c/raw/thumbnail.png -->
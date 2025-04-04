export default async function Page() {
  await new Promise((res) => {
    setTimeout(res, 3000, 'Success');
  });
  return <p>Customers Page</p>;
}

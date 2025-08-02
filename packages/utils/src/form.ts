export function createPostFormAndSubmit(params: any, action: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  form.target = '_self';
  form.style.display = 'none';
  form.id = 'redirectForm';

  params.forEach((value: string, key: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.append(input);
  });

  document.body.append(form);
  form.submit();
}

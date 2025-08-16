class NextResponse {
  constructor(body, init) {
    this.status = init?.status || 200;
    this.body = body;
  }

  json() {
    return Promise.resolve(this.body);
  }

  static next() {
    return new NextResponse(null, { status: 200 });
  }
}

module.exports = { NextResponse };
